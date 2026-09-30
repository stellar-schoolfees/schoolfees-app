import { BASE_FEE, Contract, TransactionBuilder, rpc, xdr } from '@stellar/stellar-sdk';

import type { FeeRecord, FeeStatus } from './fee';
import type { AppConfig } from './network';
import {
  addressToScVal,
  i128ToScVal,
  referenceToScVal,
  scValToFee,
  scValToStatus,
  u64ToScVal,
} from './scval';

/**
 * Talks to the deployed `schoolfees` contract over Stellar RPC.
 *
 * Every method name and argument order below matches `src/lib.rs` in
 * `schoolfees-contracts` one for one: `get_fee(u64)`, `status(u64)`,
 * `create_fee(Address, Address, BytesN<32>, i128, u64)`, `pay(u64, Address,
 * i128)`, `close_fee(u64)`, `refund(u64, Address, i128)`.
 *
 * Writes follow the standard Soroban flow: build, simulate, assemble the
 * simulation's footprint and fees, sign with the wallet, submit, poll. Contract
 * errors surface during simulation, which is what makes the mapping in
 * `contractErrors.ts` useful — by the time a transaction is submitted, the
 * contract's own validation has already passed.
 *
 * Nothing here has been exercised against a deployed contract: no testnet
 * deployment exists yet. See the README, "What is proven vs assumed".
 */
export class ContractCallError extends Error {
  /** The raw host or RPC message, read back by `describeContractError`. */
  readonly raw: string;

  constructor(raw: string) {
    super(raw);
    this.name = 'ContractCallError';
    this.raw = raw;
  }
}

export interface PreparedCall {
  /** Unsigned transaction XDR, ready for the wallet to sign. */
  readonly xdr: string;
}

export interface SubmitResult {
  /** The transaction hash — the receipt the user keeps. */
  readonly hash: string;
  /**
   * The contract's return value, when the call returned one. `create_fee`
   * returns the new fee id here, which is how the app can name the fee it just
   * created without reading events.
   */
  readonly returnValue?: xdr.ScVal;
}

export interface ContractClient {
  getFee(source: string, feeId: bigint): Promise<FeeRecord>;
  getStatus(source: string, feeId: bigint): Promise<FeeStatus>;
  prepareCreateFee(input: {
    source: string;
    school: string;
    token: string;
    reference: Uint8Array;
    total: bigint;
    dueAt: bigint;
  }): Promise<PreparedCall>;
  preparePay(input: {
    source: string;
    feeId: bigint;
    payer: string;
    amount: bigint;
  }): Promise<PreparedCall>;
  prepareRefund(input: {
    source: string;
    feeId: bigint;
    payer: string;
    amount: bigint;
  }): Promise<PreparedCall>;
  prepareCloseFee(input: { source: string; feeId: bigint }): Promise<PreparedCall>;
  /** Submits a signed transaction and returns its hash and return value. */
  submit(signedXdr: string): Promise<SubmitResult>;
}

const ARCHIVED_MESSAGE =
  'This record has been archived by the network and must be restored before it can be used. ' +
  'This app cannot restore archived records yet.';

export function createContractClient(config: AppConfig): ContractClient {
  const server = new rpc.Server(config.rpcUrl);
  const contract = new Contract(config.contractId);

  /**
   * Builds the unsigned transaction. Reads and writes both need a source
   * account: the app uses the connected wallet's address and never holds a
   * secret key of its own.
   */
  async function buildTransaction(source: string, method: string, args: xdr.ScVal[]) {
    const account = await server.getAccount(source);
    return new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: config.passphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(60)
      .build();
  }

  /**
   * Simulates a call and, on success, returns the assembled transaction XDR.
   * Throws `ContractCallError` for a contract error, an archived record, or any
   * other simulation failure.
   */
  async function assemble(source: string, method: string, args: xdr.ScVal[]): Promise<string> {
    const tx = await buildTransaction(source, method, args);
    const simulation = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationRestore(simulation)) {
      // A record archived after nobody touched it for long enough. v0 has no
      // restore flow, so say that plainly instead of failing cryptically.
      throw new ContractCallError(ARCHIVED_MESSAGE);
    }
    if (rpc.Api.isSimulationError(simulation)) {
      throw new ContractCallError(simulation.error);
    }
    return rpc.assembleTransaction(tx, simulation).build().toXDR();
  }

  /** Simulates a read-only call and returns the raw return value. */
  async function read(source: string, method: string, args: xdr.ScVal[]): Promise<xdr.ScVal> {
    const tx = await buildTransaction(source, method, args);
    const simulation = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationRestore(simulation)) {
      throw new ContractCallError(ARCHIVED_MESSAGE);
    }
    if (rpc.Api.isSimulationError(simulation)) {
      throw new ContractCallError(simulation.error);
    }
    if (!rpc.Api.isSimulationSuccess(simulation) || simulation.result === undefined) {
      throw new ContractCallError(`the contract returned no result for ${method}`);
    }
    return simulation.result.retval;
  }

  return {
    async getFee(source, feeId) {
      return scValToFee(await read(source, 'get_fee', [u64ToScVal(feeId)]));
    },

    async getStatus(source, feeId) {
      return scValToStatus(await read(source, 'status', [u64ToScVal(feeId)]));
    },

    async prepareCreateFee({ source, school, token, reference, total, dueAt }) {
      return {
        xdr: await assemble(source, 'create_fee', [
          addressToScVal(school),
          addressToScVal(token),
          referenceToScVal(reference),
          i128ToScVal(total),
          u64ToScVal(dueAt),
        ]),
      };
    },

    async preparePay({ source, feeId, payer, amount }) {
      return {
        xdr: await assemble(source, 'pay', [
          u64ToScVal(feeId),
          addressToScVal(payer),
          i128ToScVal(amount),
        ]),
      };
    },

    async prepareRefund({ source, feeId, payer, amount }) {
      return {
        xdr: await assemble(source, 'refund', [
          u64ToScVal(feeId),
          addressToScVal(payer),
          i128ToScVal(amount),
        ]),
      };
    },

    async prepareCloseFee({ source, feeId }) {
      return { xdr: await assemble(source, 'close_fee', [u64ToScVal(feeId)]) };
    },

    async submit(signedXdr) {
      const tx = TransactionBuilder.fromXDR(signedXdr, config.passphrase);
      const sent = await server.sendTransaction(tx);

      // `SendTransactionStatus` is a string union, not an enum, so these are
      // compared as literals (checked by the compiler against the SDK types).
      if (sent.status === 'ERROR') {
        throw new ContractCallError(`the network rejected this transaction (${sent.hash})`);
      }
      if (sent.status === 'TRY_AGAIN_LATER') {
        throw new ContractCallError('the network is busy. Please try again in a moment.');
      }

      const result = await server.pollTransaction(sent.hash);
      if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        return result.returnValue === undefined
          ? { hash: sent.hash }
          : { hash: sent.hash, returnValue: result.returnValue };
      }
      if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
        // The contract's own checks already ran during simulation, so a failure
        // here is not one of the codes in ERRORS.md. Report the hash rather than
        // inventing wording for it.
        throw new ContractCallError(`this transaction failed on testnet (${sent.hash})`);
      }
      throw new ContractCallError(
        `this transaction was not confirmed in time. Check it before retrying (${sent.hash})`,
      );
    },
  };
}

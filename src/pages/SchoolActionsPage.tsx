import { useState } from 'react';

import { ConnectPrompt } from '../components/ConnectPrompt';
import { ErrorNotice } from '../components/ErrorNotice';
import { FeeSummary } from '../components/FeeSummary';
import { Field } from '../components/Field';
import { TransactionResult } from '../components/TransactionResult';
import { useAction } from '../hooks/useAction';
import { parsePositiveAmount } from '../lib/amount';
import { CONTRACT_ERRORS } from '../lib/contractErrors';
import { canClose, type FeeRecord, type FeeStatus } from '../lib/fee';
import { runWrite } from '../lib/flow';
import { validateAccountAddress, validateFeeId } from '../lib/validation';
import type { PageProps } from './shared';

interface LoadedFee {
  readonly fee: FeeRecord;
  readonly status: FeeStatus;
}

// Wording comes from ERRORS.md via the mapping module; never retyped here.
const FEE_CLOSED_MESSAGE = CONTRACT_ERRORS[10]?.message ?? 'This fee is closed.';
const CLOSE_NOT_ALLOWED_MESSAGE =
  CONTRACT_ERRORS[11]?.message ??
  'This fee still has part of a payment on it. Refund the remaining payments before closing.';

/**
 * The two things only the fee's school can do: refund a payer, and close the
 * record. Both are signed by the connected wallet, which the contract checks
 * against the school address stored on the fee.
 */
export function SchoolActionsPage({ client, config, wallet }: PageProps) {
  const [feeId, setFeeId] = useState('');
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState('');
  const [feeIdError, setFeeIdError] = useState<string | null>(null);
  const [payerError, setPayerError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const load = useAction<LoadedFee>();
  const refund = useAction<{ hash: string }>();
  const close = useAction<{ hash: string }>();

  if (wallet.address === null) {
    return (
      <section>
        <h1>School actions</h1>
        <ConnectPrompt wallet={wallet} />
      </section>
    );
  }

  const address = wallet.address;
  const loaded = load.result;

  async function lookup() {
    const check = validateFeeId(feeId);
    if (!check.ok) {
      setFeeIdError(check.message);
      return;
    }
    setFeeIdError(null);
    refund.reset();
    close.reset();

    await load.run(async () => {
      const fee = await client.getFee(address, check.value);
      const status = await client.getStatus(address, check.value);
      return { fee, status };
    });
  }

  async function submitRefund() {
    if (loaded === null) return;

    const payerCheck = validateAccountAddress(payer);
    const amountCheck = parsePositiveAmount(amount);
    setPayerError(payerCheck.ok ? null : payerCheck.message);
    setAmountError(amountCheck.ok ? null : amountCheck.message);
    if (!payerCheck.ok || !amountCheck.ok) return;

    await refund.run(async () => {
      const result = await runWrite(client, address, config.passphrase, () =>
        client.prepareRefund({
          source: address,
          feeId: loaded.fee.id,
          payer: payerCheck.value,
          amount: amountCheck.value,
        }),
      );
      return { hash: result.hash };
    });

    // Re-read the fee so the summary reflects the refund.
    if (refund.result !== null) {
      await load.run(async () => {
        const fee = await client.getFee(address, loaded.fee.id);
        const status = await client.getStatus(address, loaded.fee.id);
        return { fee, status };
      });
    }
  }

  async function submitClose() {
    if (loaded === null) return;

    await close.run(async () => {
      const result = await runWrite(client, address, config.passphrase, () =>
        client.prepareCloseFee({ source: address, feeId: loaded.fee.id }),
      );
      return { hash: result.hash };
    });

    // Re-read the fee so the summary reflects the close.
    if (close.result !== null) {
      await load.run(async () => {
        const fee = await client.getFee(address, loaded.fee.id);
        const status = await client.getStatus(address, loaded.fee.id);
        return { fee, status };
      });
    }
  }

  return (
    <section>
      <h1>School actions</h1>
      <p>
        Refunds are paid from the school&rsquo;s own balance, capped at what that payer still has
        paid. A fee can only be closed when nothing is owed or nothing was paid.
      </p>

      <Field
        id="schoolFeeId"
        label="Fee id"
        value={feeId}
        onChange={setFeeId}
        inputMode="numeric"
        placeholder="1"
        required
        error={feeIdError}
      />

      <button type="button" onClick={() => void lookup()} disabled={load.busy}>
        {load.busy ? 'Loading…' : 'Look up the fee'}
      </button>

      {load.error !== null && <ErrorNotice error={load.error} />}

      {loaded !== null && (
        <>
          <FeeSummary fee={loaded.fee} status={loaded.status} explorerBaseUrl={config.explorerBaseUrl} />

          {loaded.fee.closed ? (
            <div className="notice" role="note">
              <p>{FEE_CLOSED_MESSAGE}</p>
            </div>
          ) : (
            <>
              <fieldset disabled={refund.busy}>
                <legend>Refund a payer</legend>
                <Field
                  id="refundPayer"
                  label="Payer address"
                  value={payer}
                  onChange={setPayer}
                  placeholder="G…"
                  mono
                  required
                  hint="The account that paid. It must have a payment record on this fee, or the contract refuses the refund."
                  error={payerError}
                />
                <Field
                  id="refundAmount"
                  label="Amount to refund"
                  value={amount}
                  onChange={setAmount}
                  inputMode="numeric"
                  required
                  hint="At most what that payer still has paid. Paid out of the school's own balance, so it must hold the tokens."
                  error={amountError}
                />
                <button type="button" onClick={() => void submitRefund()}>
                  Sign and refund
                </button>
              </fieldset>

              {refund.error !== null && <ErrorNotice error={refund.error} />}
              {refund.result !== null && (
                <TransactionResult
                  hash={refund.result.hash}
                  explorerBaseUrl={config.explorerBaseUrl}
                  label="Refund submitted"
                />
              )}

              <fieldset disabled={close.busy}>
                <legend>Close the fee</legend>
                <p>
                  {canClose(loaded.fee)
                    ? 'This fee can be closed. Closing is permanent: nothing further can be paid or refunded.'
                    : CLOSE_NOT_ALLOWED_MESSAGE}
                </p>
                <button type="button" onClick={() => void submitClose()} disabled={!canClose(loaded.fee)}>
                  Sign and close
                </button>
              </fieldset>

              {close.error !== null && <ErrorNotice error={close.error} />}
              {close.result !== null && (
                <TransactionResult
                  hash={close.result.hash}
                  explorerBaseUrl={config.explorerBaseUrl}
                  label="Fee closed"
                />
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

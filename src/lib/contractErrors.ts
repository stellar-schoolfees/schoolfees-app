/**
 * Contract error code -> plain-language message.
 *
 * Every string below is copied **verbatim** from the "user-facing message" and
 * "next action" columns of `ERRORS.md` in `schoolfees-contracts`. That file is
 * the single source of truth: `AGENTS.md` forbids inventing different wording,
 * and `src/lib/contractErrors.test.ts` fails if a variant in the vendored copy
 * of that table (`docs/contract-errors.md`) has no message here.
 *
 * Do not reword these by hand. If `ERRORS.md` changes, re-copy it and update
 * this table in the same commit.
 */

export interface ContractErrorInfo {
  readonly variant: string;
  readonly message: string;
  readonly nextAction: string;
}

export const CONTRACT_ERRORS: Readonly<Partial<Record<number, ContractErrorInfo>>> = {
  1: {
    variant: 'NotInitialized',
    message: 'This contract is not set up yet.',
    nextAction: 'Ask the administrator to run setup.',
  },
  2: {
    variant: 'AlreadyInitialized',
    message: 'This contract is already set up.',
    nextAction: 'No action needed.',
  },
  3: {
    variant: 'FeeNotFound',
    message: "We couldn't find that fee. Check the reference with the school.",
    nextAction: 'Ask the school to confirm the fee reference.',
  },
  4: {
    variant: 'PayerNotFound',
    message: 'That address has no payment on this fee, so there is nothing to refund.',
    nextAction: 'Check the payer address and the fee.',
  },
  10: {
    variant: 'FeeClosed',
    message: 'This fee is closed — no more payments or refunds can be made.',
    nextAction: 'Contact the school if you think this is wrong.',
  },
  11: {
    variant: 'CloseNotAllowed',
    message:
      'This fee still has part of a payment on it. Refund the remaining payments before closing.',
    nextAction: 'Refund the outstanding payments, then close the fee.',
  },
  12: {
    variant: 'DueDateInPast',
    message: 'The due date must be in the future.',
    nextAction: 'Choose a new due date.',
  },
  30: {
    variant: 'InvalidAmount',
    message: 'Enter an amount greater than zero.',
    nextAction: 'Correct the amount and try again.',
  },
  31: {
    variant: 'Overpayment',
    message: 'That is more than the amount still owed.',
    nextAction: 'Pay the remaining balance or less.',
  },
  32: {
    variant: 'DuplicateReference',
    message: 'A fee with this reference already exists for this school.',
    nextAction: 'Use a new reference, or open the existing fee.',
  },
  33: {
    variant: 'RefundExceedsPaid',
    message: 'You can refund at most what this payer still has paid.',
    nextAction: 'Lower the refund amount.',
  },
};

/**
 * Shown when a failure has no message at all to pass on. It is deliberately
 * generic: it is not a message from `ERRORS.md` and must not pretend to be one.
 */
export const GENERIC_ERROR_MESSAGE =
  'Something went wrong. Please check your connection and try again.';

/**
 * Thrown when the wallet is not on testnet. The app refuses to operate, so the
 * message must say what to do rather than blaming the user's connection.
 */
export const WRONG_NETWORK_MESSAGE =
  'Your wallet is set to a different network. Switch it to testnet and try again.';

export interface MappedError {
  readonly message: string;
  readonly nextAction?: string;
  readonly code?: number;
}

/** Pulls the message text out of whatever was thrown. */
function messageOf(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error !== null && typeof error === 'object' && 'message' in error) {
    const value: unknown = (error as { message: unknown }).message;
    if (typeof value === 'string') return value;
  }
  return '';
}

/**
 * Finds a Soroban contract error code in a host error string.
 *
 * Stellar RPC reports these as, for example,
 * `HostError: Error(Contract, #3)`. The code is the number after `#`.
 */
export function parseContractErrorCode(text: string): number | null {
  const match = /Error\(Contract,\s*#(\d+)\)/.exec(text) ?? /Contract,\s*#(\d+)/.exec(text);
  if (match === null) return null;
  return Number(match[1]);
}

/**
 * Turns any thrown value into a message the user can act on.
 *
 * Order of preference:
 * 1. a contract error code with reviewed wording in `ERRORS.md`;
 * 2. a contract error code without reviewed wording — a generic message that
 *    names the code, so it can be reported and added to `ERRORS.md`;
 * 3. the error's own message, for things that are not contract errors at all
 *    (a rejected wallet prompt, an RPC outage, a wrong-network refusal);
 * 4. a generic message when there is nothing at all to pass on.
 */
export function describeContractError(error: unknown): MappedError {
  const text = messageOf(error);
  const code = parseContractErrorCode(text);

  if (code !== null) {
    const known = CONTRACT_ERRORS[code];
    if (known !== undefined) {
      return { message: known.message, nextAction: known.nextAction, code };
    }

    // TODO(verify): this code is not in ERRORS.md in schoolfees-contracts, so
    // there is no reviewed wording for it. Name the code so it can be added.
    return {
      message: `Something went wrong (contract error code ${code}). Please report this.`,
      code,
    };
  }

  if (text !== '') {
    return { message: text };
  }
  return { message: GENERIC_ERROR_MESSAGE };
}

/** Convenience wrapper when only the message is needed. */
export function mapContractError(error: unknown): string {
  return describeContractError(error).message;
}

export interface ErrorTableRow {
  readonly code: number;
  readonly variant: string;
  readonly message: string;
  readonly nextAction: string;
}

function stripQuotes(value: string): string {
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Parses the error rows out of an `ERRORS.md`-shaped markdown table. Used by the
 * test that keeps this module in sync with the contract's error table.
 */
export function parseErrorTable(markdown: string): ErrorTableRow[] {
  const rows: ErrorTableRow[] = [];

  for (const line of markdown.split(/\r?\n/)) {
    if (!line.trimStart().startsWith('|')) continue;

    const cells = line.split('|');
    // | code | variant | raised by | trigger | message | next action |
    if (cells.length !== 8) continue;

    const code = cells[1].trim();
    if (!/^\d+$/.test(code)) continue;

    rows.push({
      code: Number(code),
      variant: cells[2].trim().replace(/`/g, ''),
      message: stripQuotes(cells[5].trim()),
      nextAction: cells[6].trim(),
    });
  }

  return rows;
}

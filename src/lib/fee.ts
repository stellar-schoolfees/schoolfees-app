/**
 * Shapes and helpers for the contract's `Fee` record and `FeeStatus` enum
 * (`src/types.rs` in `schoolfees-contracts`).
 *
 * Amounts are `bigint` because the contract stores `i128` and the SDK converts
 * those to `bigint`.
 */

export interface FeeRecord {
  readonly id: bigint;
  readonly school: string;
  readonly token: string;
  readonly reference: Uint8Array;
  readonly total: bigint;
  readonly dueAt: bigint;
  readonly paidTotal: bigint;
  readonly refundedTotal: bigint;
  readonly closed: boolean;
}

/** The four values the contract can report, plus `Unknown` for anything else. */
export type FeeStatus = 'Open' | 'Paid' | 'Overdue' | 'Closed' | 'Unknown';

export const KNOWN_FEE_STATUSES = ['Open', 'Paid', 'Overdue', 'Closed'] as const;

/** `paid_total - refunded_total`, exactly as `src/fee.rs::net_paid` computes it. */
export function netPaid(fee: FeeRecord): bigint {
  return fee.paidTotal - fee.refundedTotal;
}

/** `total - net`, never negative. */
export function remaining(fee: FeeRecord): bigint {
  const left = fee.total - netPaid(fee);
  return left > 0n ? left : 0n;
}

/**
 * Reads the value returned by `status()`.
 *
 * A Rust unit-only enum is encoded as a symbol, so the SDK normally hands back
 * a plain string like `"Open"`. The vec and object forms are accepted too so
 * that a different encoding shows the real status instead of "Unknown". This
 * has not been exercised against a deployed contract — see the README's
 * "What is proven vs assumed".
 */
export function normalizeStatus(raw: unknown): FeeStatus {
  if (typeof raw === 'string') {
    return isKnownStatus(raw) ? raw : 'Unknown';
  }
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') {
    return isKnownStatus(raw[0]) ? raw[0] : 'Unknown';
  }
  if (raw !== null && typeof raw === 'object') {
    const keys = Object.keys(raw);
    if (keys.length === 1 && isKnownStatus(keys[0])) {
      return keys[0];
    }
  }
  return 'Unknown';
}

function isKnownStatus(value: string): value is (typeof KNOWN_FEE_STATUSES)[number] {
  return (KNOWN_FEE_STATUSES as readonly string[]).includes(value);
}

/**
 * Derives the status from the record, following the order in
 * `docs/design/interface-v0.md` section 5 exactly. This is only a fallback for
 * when `status()` returns something unrecognisable; the on-chain value wins.
 */
export function deriveStatus(fee: FeeRecord, nowSeconds: number): Exclude<FeeStatus, 'Unknown'> {
  if (fee.closed) return 'Closed';
  if (netPaid(fee) >= fee.total) return 'Paid';
  if (BigInt(Math.floor(nowSeconds)) > fee.dueAt) return 'Overdue';
  return 'Open';
}

/** A plain-words sentence for each status. */
export function describeStatus(status: FeeStatus): string {
  switch (status) {
    case 'Open':
      return 'Not yet fully paid, and the due date has not passed.';
    case 'Paid':
      return 'Fully paid. The school can close it.';
    case 'Overdue':
      return 'The due date has passed and a balance is still owed. Payments are still accepted.';
    case 'Closed':
      return 'Closed by the school. Nothing further can be paid, refunded or closed.';
    case 'Unknown':
      return 'The contract returned a status this app does not recognise.';
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

/**
 * Whether the contract will accept `close_fee` for this record: nothing owed or
 * nothing paid (`src/fee.rs::close_fee`).
 */
export function canClose(fee: FeeRecord): boolean {
  if (fee.closed) return false;
  const net = netPaid(fee);
  return net === 0n || net === fee.total;
}

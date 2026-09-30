import { Address, nativeToScVal, scValToNative, xdr } from '@stellar/stellar-sdk';

import { normalizeStatus, type FeeRecord, type FeeStatus } from './fee';
import { REFERENCE_BYTES } from './reference';

/**
 * Converts between JavaScript values and the `xdr.ScVal` values the contract's
 * ABI uses. The conversions match `src/lib.rs` in `schoolfees-contracts`:
 * `Address`, `BytesN<32>`, `i128` and `u64`.
 */

export function addressToScVal(address: string): xdr.ScVal {
  return Address.fromString(address).toScVal();
}

export function i128ToScVal(value: bigint): xdr.ScVal {
  return nativeToScVal(value, { type: 'i128' });
}

export function u64ToScVal(value: bigint): xdr.ScVal {
  return nativeToScVal(value, { type: 'u64' });
}

/** `BytesN<32>` — the contract's opaque reference. */
export function referenceToScVal(bytes: Uint8Array): xdr.ScVal {
  if (bytes.length !== REFERENCE_BYTES) {
    throw new Error(
      `a contract reference is exactly ${REFERENCE_BYTES} bytes, got ${bytes.length}`,
    );
  }
  return nativeToScVal(bytes, { type: 'bytes' });
}

function asObject(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    throw new Error('the contract returned an unexpected value');
  }
  return value as Record<string, unknown>;
}

function asBigInt(value: unknown, field: string): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number' && Number.isInteger(value)) return BigInt(value);
  throw new Error(`the contract returned an unexpected "${field}"`);
}

function asString(value: unknown, field: string): string {
  if (typeof value === 'string') return value;
  throw new Error(`the contract returned an unexpected "${field}"`);
}

function asBoolean(value: unknown, field: string): boolean {
  if (typeof value === 'boolean') return value;
  throw new Error(`the contract returned an unexpected "${field}"`);
}

function asBytes(value: unknown, field: string): Uint8Array {
  if (value instanceof Uint8Array) return value;
  throw new Error(`the contract returned an unexpected "${field}"`);
}

/** `create_fee` returns the new `u64` fee id. */
export function scValToFeeId(retval: xdr.ScVal): bigint {
  return asBigInt(scValToNative(retval), 'fee_id');
}

/** `status()` returns a `FeeStatus`. */
export function scValToStatus(retval: xdr.ScVal): FeeStatus {
  return normalizeStatus(scValToNative(retval));
}

/** `get_fee` returns a `Fee` struct. */
export function scValToFee(retval: xdr.ScVal): FeeRecord {
  const raw = asObject(scValToNative(retval));
  return {
    id: asBigInt(raw.id, 'id'),
    school: asString(raw.school, 'school'),
    token: asString(raw.token, 'token'),
    reference: asBytes(raw.reference, 'reference'),
    total: asBigInt(raw.total, 'total'),
    dueAt: asBigInt(raw.due_at, 'due_at'),
    paidTotal: asBigInt(raw.paid_total, 'paid_total'),
    refundedTotal: asBigInt(raw.refunded_total, 'refunded_total'),
    closed: asBoolean(raw.closed, 'closed'),
  };
}

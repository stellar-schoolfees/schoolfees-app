import { Keypair, nativeToScVal, scValToNative, StrKey, xdr } from '@stellar/stellar-sdk';
import { describe, expect, it } from 'vitest';

import type { FeeRecord } from './fee';
import {
  addressToScVal,
  i128ToScVal,
  referenceToScVal,
  scValToFee,
  scValToFeeId,
  scValToStatus,
  u64ToScVal,
} from './scval';

const SCHOOL = Keypair.random().publicKey();
const TOKEN = StrKey.encodeContract(new Uint8Array(32).fill(5));

/**
 * Builds the `ScVal` the contract's `Fee` struct produces, using the same type
 * hints as the real ABI (u64, i128, address, bytes, bool).
 */
function feeScVal(overrides: Partial<FeeRecord> = {}): xdr.ScVal {
  const fee: FeeRecord = {
    id: 1n,
    school: SCHOOL,
    token: TOKEN,
    reference: new Uint8Array(32).fill(7),
    total: 5000n,
    dueAt: 1_790_000_000n,
    paidTotal: 1500n,
    refundedTotal: 200n,
    closed: false,
    ...overrides,
  };

  return nativeToScVal(
    {
      id: fee.id,
      school: fee.school,
      token: fee.token,
      reference: fee.reference,
      total: fee.total,
      due_at: fee.dueAt,
      paid_total: fee.paidTotal,
      refunded_total: fee.refundedTotal,
      closed: fee.closed,
    },
    {
      type: {
        id: [null, 'u64'],
        school: [null, 'address'],
        token: [null, 'address'],
        reference: [null, 'bytes'],
        total: [null, 'i128'],
        due_at: [null, 'u64'],
        paid_total: [null, 'i128'],
        refunded_total: [null, 'i128'],
        closed: [null, 'bool'],
      },
    },
  );
}

describe('argument conversion', () => {
  it('converts an address and converts back to the same strkey', () => {
    expect(scValToNative(addressToScVal(SCHOOL))).toBe(SCHOOL);
  });

  it('converts a u64 fee id', () => {
    expect(scValToNative(u64ToScVal(42n))).toBe(42n);
  });

  it('converts an i128 amount', () => {
    expect(scValToNative(i128ToScVal(5000n))).toBe(5000n);
  });

  it('converts a 32-byte reference', () => {
    const bytes = new Uint8Array(32).fill(9);
    expect(scValToNative(referenceToScVal(bytes))).toEqual(bytes);
  });

  it('refuses a reference that is not 32 bytes', () => {
    expect(() => referenceToScVal(new Uint8Array(31))).toThrow(/32 bytes/);
  });
});

describe('response conversion', () => {
  it('reads a fee id', () => {
    expect(scValToFeeId(u64ToScVal(7n))).toBe(7n);
  });

  it('reads a fee id returned as a plain number', () => {
    expect(scValToFeeId(nativeToScVal(7, { type: 'u64' }))).toBe(7n);
  });

  it('parses a Fee record back into the app shape', () => {
    const parsed = scValToFee(feeScVal());
    expect(parsed.id).toBe(1n);
    expect(parsed.school).toBe(SCHOOL);
    expect(parsed.token).toBe(TOKEN);
    expect(parsed.reference).toHaveLength(32);
    expect(parsed.reference[0]).toBe(7);
    expect(parsed.total).toBe(5000n);
    expect(parsed.dueAt).toBe(1_790_000_000n);
    expect(parsed.paidTotal).toBe(1500n);
    expect(parsed.refundedTotal).toBe(200n);
    expect(parsed.closed).toBe(false);
  });

  it('parses a closed paid fee', () => {
    const parsed = scValToFee(feeScVal({ closed: true, paidTotal: 5000n, refundedTotal: 0n }));
    expect(parsed.closed).toBe(true);
    expect(parsed.paidTotal).toBe(5000n);
  });

  it('rejects a response that is not a fee record', () => {
    expect(() => scValToFee(u64ToScVal(1n))).toThrow(/unexpected/);
  });

  it('reads a symbol-encoded status, which is what a unit enum produces', () => {
    expect(scValToStatus(xdr.ScVal.scvSymbol('Overdue'))).toBe('Overdue');
    expect(scValToStatus(xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('Paid')]))).toBe('Paid');
  });

  it('does not guess at an unrecognised status', () => {
    expect(scValToStatus(xdr.ScVal.scvSymbol('Something' ))).toBe('Unknown');
  });
});

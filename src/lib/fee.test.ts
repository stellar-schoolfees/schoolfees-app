import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { describe, expect, it } from 'vitest';

import {
  canClose,
  deriveStatus,
  describeStatus,
  netPaid,
  normalizeStatus,
  remaining,
  type FeeRecord,
} from './fee';

// Generated, never written out by hand: this repo holds no made-up addresses.
const SCHOOL = Keypair.random().publicKey();
const TOKEN = StrKey.encodeContract(new Uint8Array(32).fill(4));

function fee(overrides: Partial<FeeRecord> = {}): FeeRecord {
  return {
    id: 1n,
    school: SCHOOL,
    token: TOKEN,
    reference: new Uint8Array(32),
    total: 5000n,
    dueAt: 1_800_000_000n,
    paidTotal: 0n,
    refundedTotal: 0n,
    closed: false,
    ...overrides,
  };
}

describe('amounts', () => {
  it('computes net and remaining', () => {
    const record = fee({ paidTotal: 1500n, refundedTotal: 200n });
    expect(netPaid(record)).toBe(1300n);
    expect(remaining(record)).toBe(3700n);
  });

  it('never reports a negative remaining', () => {
    const record = fee({ total: 100n, paidTotal: 150n });
    expect(remaining(record)).toBe(0n);
  });
});

describe('normalizeStatus', () => {
  it('reads a symbol-encoded status, which is what the SDK returns', () => {
    expect(normalizeStatus('Open')).toBe('Open');
    expect(normalizeStatus('Paid')).toBe('Paid');
    expect(normalizeStatus('Overdue')).toBe('Overdue');
    expect(normalizeStatus('Closed')).toBe('Closed');
  });

  it('also handles a single-element vec and an object form', () => {
    expect(normalizeStatus(['Overdue'])).toBe('Overdue');
    expect(normalizeStatus({ Closed: undefined })).toBe('Closed');
  });

  it('returns Unknown rather than guessing', () => {
    expect(normalizeStatus('Cancelled')).toBe('Unknown');
    expect(normalizeStatus(undefined)).toBe('Unknown');
    expect(normalizeStatus({ A: 1, B: 2 })).toBe('Unknown');
  });
});

describe('deriveStatus', () => {
  it('follows the documented order: closed, paid, overdue, open', () => {
    const dueAt = 1000n;
    expect(deriveStatus(fee({ closed: true }), 5000)).toBe('Closed');
    expect(deriveStatus(fee({ total: 10n, paidTotal: 10n }), 5000)).toBe('Paid');
    expect(deriveStatus(fee({ total: 10n, paidTotal: 20n }), 1)).toBe('Paid');
    expect(deriveStatus(fee({ dueAt }), 1001)).toBe('Overdue');
    expect(deriveStatus(fee({ dueAt }), 1000)).toBe('Open');
  });

  it('treats a refunded fee as not fully paid again', () => {
    const record = fee({ total: 100n, paidTotal: 100n, refundedTotal: 40n });
    expect(deriveStatus(record, 1)).toBe('Open');
  });
});

describe('describeStatus', () => {
  it('returns a sentence for every status', () => {
    for (const status of ['Open', 'Paid', 'Overdue', 'Closed', 'Unknown'] as const) {
      expect(describeStatus(status).length).toBeGreaterThan(0);
    }
  });
});

describe('canClose', () => {
  it('allows closing when nothing is owed or nothing was paid', () => {
    expect(canClose(fee())).toBe(true);
    expect(canClose(fee({ total: 100n, paidTotal: 100n }))).toBe(true);
    expect(canClose(fee({ total: 100n, paidTotal: 100n, refundedTotal: 100n }))).toBe(true);
  });

  it('refuses a partially paid fee, which the contract also refuses', () => {
    expect(canClose(fee({ total: 100n, paidTotal: 40n }))).toBe(false);
  });

  it('refuses an already closed fee', () => {
    expect(canClose(fee({ closed: true }))).toBe(false);
  });
});

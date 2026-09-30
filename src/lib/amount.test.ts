import { describe, expect, it } from 'vitest';

import { formatAmount, parsePositiveAmount } from './amount';

describe('parsePositiveAmount', () => {
  it('accepts a whole positive amount', () => {
    const result = parsePositiveAmount('5000');
    expect(result).toEqual({ ok: true, value: 5000n });
  });

  it('accepts a very large i128-sized amount', () => {
    const huge = '170141183460469231731687303715884105727';
    const result = parsePositiveAmount(huge);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toBe(BigInt(huge));
  });

  it('trims surrounding whitespace', () => {
    expect(parsePositiveAmount('  42  ')).toEqual({ ok: true, value: 42n });
  });

  it('rejects zero and negative amounts with the contract wording', () => {
    // The wording matches the InvalidAmount row in ERRORS.md.
    expect(parsePositiveAmount('0')).toEqual({
      ok: false,
      message: 'Enter an amount greater than zero.',
    });
    expect(parsePositiveAmount('-5')).toEqual({
      ok: false,
      message: 'Enter an amount greater than zero.',
    });
  });

  it('rejects empty input', () => {
    const result = parsePositiveAmount('   ');
    expect(result.ok).toBe(false);
  });

  it('rejects decimals rather than guessing a decimals count', () => {
    const result = parsePositiveAmount('10.50');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain('whole number');
  });

  it('rejects anything that is not digits', () => {
    expect(parsePositiveAmount('1,000').ok).toBe(false);
    expect(parsePositiveAmount('abc').ok).toBe(false);
    expect(parsePositiveAmount('1e3').ok).toBe(false);
  });
});

describe('formatAmount', () => {
  it('groups thousands', () => {
    expect(formatAmount(0n)).toBe('0');
    expect(formatAmount(999n)).toBe('999');
    expect(formatAmount(1000n)).toBe('1,000');
    expect(formatAmount(1234567n)).toBe('1,234,567');
    expect(formatAmount(170141183460469231731687303715884105727n)).toBe(
      '170,141,183,460,469,231,731,687,303,715,884,105,727',
    );
  });

  it('handles a negative value', () => {
    expect(formatAmount(-1500n)).toBe('-1,500');
  });
});

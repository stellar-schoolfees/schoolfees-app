import { describe, expect, it } from 'vitest';

import {
  bytesToHex,
  formatReference,
  REFERENCE_BYTES,
  REFERENCE_HEX_LENGTH,
  REFERENCE_HINT,
  REFERENCE_WARNING,
  validateReference,
} from './reference';

const VALID = 'a1'.repeat(32);

describe('validateReference', () => {
  it('accepts exactly 64 hexadecimal characters as 32 bytes', () => {
    const result = validateReference(VALID);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.hex).toBe(VALID);
    expect(result.bytes).toHaveLength(REFERENCE_BYTES);
    expect(result.bytes[0]).toBe(0xa1);
    expect(result.bytes[31]).toBe(0xa1);
  });

  it('accepts uppercase and stores it lower-case', () => {
    const result = validateReference(VALID.toUpperCase());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.hex).toBe(VALID);
  });

  it('rejects the wrong length and says what the right length is', () => {
    const result = validateReference('ab'.repeat(31));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain(String(REFERENCE_HEX_LENGTH));
    expect(result.message).toContain(String(REFERENCE_BYTES));
  });

  it('rejects non-hexadecimal characters even at the right length', () => {
    const result = validateReference('z'.repeat(REFERENCE_HEX_LENGTH));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain('hexadecimal');
  });

  it('rejects a nicely formatted but non-hex value', () => {
    const result = validateReference(`0x${'ab'.repeat(31)}`);
    expect(result.ok).toBe(false);
  });

  it('rejects empty input', () => {
    expect(validateReference('   ').ok).toBe(false);
  });

  it('rejects an obvious placeholder like ref_0001', () => {
    // Placeholders are fine for documentation, never for a chain payload.
    expect(validateReference('ref_0001').ok).toBe(false);
  });

  it('rejects free text, because the contract cannot tell data from bytes', () => {
    expect(validateReference('student-name').ok).toBe(false);
    expect(validateReference('+234 800 000 0000').ok).toBe(false);
  });
});

describe('the plain-words warning', () => {
  it('names the things that must never be entered', () => {
    const warning = REFERENCE_WARNING.toLowerCase();
    for (const word of ['name', 'phone', 'email', 'student']) {
      expect(warning).toContain(word);
    }
  });

  it('states the accepted form', () => {
    expect(REFERENCE_HINT).toContain('64');
    expect(REFERENCE_HINT).toContain('32 bytes');
  });
});

describe('reference display helpers', () => {
  it('round-trips bytes to hex', () => {
    const result = validateReference(VALID);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(bytesToHex(result.bytes)).toBe(VALID);
  });

  it('keeps a short reference intact and shortens a long one', () => {
    expect(formatReference('abcd')).toBe('0xabcd');
    const formatted = formatReference(VALID);
    expect(formatted.startsWith('0x')).toBe(true);
    expect(formatted).toContain('…');
  });
});

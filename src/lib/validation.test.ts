import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { describe, expect, it } from 'vitest';

import { validateAccountAddress, validateContractAddress, validateFeeId } from './validation';

const ACCOUNT = Keypair.random().publicKey();
const CONTRACT = StrKey.encodeContract(new Uint8Array(32).fill(9));

describe('validateAccountAddress', () => {
  it('accepts a public key', () => {
    expect(validateAccountAddress(ACCOUNT)).toEqual({ ok: true, value: ACCOUNT });
  });

  it('rejects a contract address and says what is expected', () => {
    const result = validateAccountAddress(CONTRACT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain('start with G');
  });

  it('rejects empty input', () => {
    expect(validateAccountAddress('  ').ok).toBe(false);
  });

  it('rejects a secret key shaped value', () => {
    // Starts with S, never a valid account address. The app never asks for one.
    expect(validateAccountAddress(`S${'A'.repeat(55)}`).ok).toBe(false);
  });
});

describe('validateContractAddress', () => {
  it('accepts a contract id', () => {
    expect(validateContractAddress(CONTRACT)).toEqual({ ok: true, value: CONTRACT });
  });

  it('rejects an account address and says what is expected', () => {
    const result = validateContractAddress(ACCOUNT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain('start with C');
  });

  it('rejects a placeholder', () => {
    expect(validateContractAddress('YOUR_DEPLOYED_TESTNET_CONTRACT_ID').ok).toBe(false);
  });
});

describe('validateFeeId', () => {
  it('accepts ids from 1 upwards', () => {
    expect(validateFeeId('1')).toEqual({ ok: true, value: 1n });
    expect(validateFeeId(' 42 ')).toEqual({ ok: true, value: 42n });
  });

  it('rejects 0 because fee ids start at 1', () => {
    const result = validateFeeId('0');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain('start at 1');
  });

  it('rejects non-numeric input', () => {
    expect(validateFeeId('fee-1').ok).toBe(false);
    expect(validateFeeId('1.5').ok).toBe(false);
    expect(validateFeeId('-3').ok).toBe(false);
    expect(validateFeeId('').ok).toBe(false);
  });
});

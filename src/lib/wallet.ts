import { Networks, StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';

import { isTestnetPassphrase } from './network';

/**
 * The wallet adapter, over Stellar Wallets Kit (`@creit.tech/stellar-wallets-kit`).
 *
 * The kit only ever hands the app a public address and a signed XDR. This module
 * never asks for, receives, stores or logs a secret key or seed phrase — that is
 * a project rule, not just a convention, and there is no code path here that
 * could do it.
 *
 * The kit is initialised once, pinned to testnet, and every session is
 * re-checked against the testnet passphrase before the app will build a
 * transaction (`assertWalletOnTestnet`).
 */

let initialised = false;

/** Initialises the kit once. Safe to call from an effect. */
export function initWallet(): void {
  if (initialised) return;
  StellarWalletsKit.init({
    modules: defaultModules(),
    // Pinned to testnet: the kit will not be asked for any other network.
    network: Networks.TESTNET,
  });
  initialised = true;
}

/** Opens the wallet picker and returns the connected public address. */
export async function connectWallet(): Promise<string> {
  initWallet();
  const { address } = await StellarWalletsKit.authModal();
  if (address === '') {
    throw new Error('The wallet did not return an address.');
  }
  return address;
}

/** Returns the address the kit already remembers, or null if none. */
export async function rememberedAddress(): Promise<string | null> {
  initWallet();
  try {
    const { address } = await StellarWalletsKit.getAddress();
    return address === '' ? null : address;
  } catch {
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  initWallet();
  await StellarWalletsKit.disconnect();
}

/** Asks the wallet to sign an unsigned transaction XDR. */
export async function signWithWallet(
  xdr: string,
  address: string,
  passphrase: string,
): Promise<string> {
  initWallet();
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
    networkPassphrase: passphrase,
    address,
  });
  return signedTxXdr;
}

export interface WalletNetworkCheck {
  readonly onTestnet: boolean;
  readonly passphrase: string;
}

/**
 * Reads the network the wallet is currently set to and reports whether it is
 * testnet. The app refuses to act when this is false.
 */
export async function checkWalletNetwork(): Promise<WalletNetworkCheck> {
  initWallet();
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  return { onTestnet: isTestnetPassphrase(networkPassphrase), passphrase: networkPassphrase };
}

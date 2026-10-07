// @vitest-environment happy-dom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWallet } from './useWallet';
import { checkWalletNetwork, connectWallet, disconnectWallet, rememberedAddress } from '../lib/wallet';
vi.mock('../lib/wallet', () => ({ checkWalletNetwork: vi.fn(), connectWallet: vi.fn(), disconnectWallet: vi.fn(), rememberedAddress: vi.fn() }));
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(rememberedAddress).mockResolvedValue(null);
  vi.mocked(disconnectWallet).mockResolvedValue();
  vi.mocked(checkWalletNetwork).mockResolvedValue({ onTestnet: true, passphrase: 'test fixture' });
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
describe('useWallet request lifecycle', () => {
  it('shows an object-shaped wallet rejection without losing its reason', async () => {
    vi.mocked(connectWallet).mockRejectedValue({ code: -1, message: 'Wallet prompt cancelled' });
    const { result } = renderHook(useWallet);
    await act(async () => { await result.current.connect(); });
    expect(result.current.error).toBe('Wallet prompt cancelled');
    expect(result.current.connecting).toBe(false);
  });
  it('does not restore an address after disconnect', async () => {
    const pending = deferred<string | null>();
    vi.mocked(rememberedAddress).mockReturnValue(pending.promise);
    const { result } = renderHook(useWallet);
    await act(async () => { await result.current.disconnect(); });
    expect(result.current.connecting).toBe(false);
    await act(async () => { pending.resolve('synthetic address'); await pending.promise; });
    expect(result.current.address).toBeNull();
    expect(checkWalletNetwork).not.toHaveBeenCalled();
  });
  it('drops duplicate connections and a late connection after disconnect', async () => {
    const pending = deferred<string>();
    vi.mocked(connectWallet).mockReturnValue(pending.promise);
    const { result } = renderHook(useWallet);
    let run!: Promise<void>;
    await act(async () => { run = result.current.connect(); await result.current.connect(); });
    expect(connectWallet).toHaveBeenCalledTimes(1);
    await act(async () => { await result.current.disconnect(); });
    expect(result.current.connecting).toBe(false);
    await act(async () => { await result.current.connect(); });
    expect(connectWallet).toHaveBeenCalledTimes(1);
    await act(async () => { pending.resolve('synthetic address'); await run; });
    expect(result.current.address).toBeNull();
    expect(result.current.onTestnet).toBeNull();
    expect(result.current.connecting).toBe(false);
  });
  it('ignores a stale network response after disconnect', async () => {
    vi.mocked(connectWallet).mockResolvedValue('synthetic address');
    const pending = deferred<{ onTestnet: boolean; passphrase: string }>();
    vi.mocked(checkWalletNetwork).mockReturnValue(pending.promise);
    const { result } = renderHook(useWallet);
    let run!: Promise<void>;
    await act(async () => { run = result.current.connect(); await Promise.resolve(); });
    await act(async () => { await result.current.disconnect(); });
    await act(async () => { pending.resolve({ onTestnet: true, passphrase: 'fixture' }); await run; });
    expect(result.current.onTestnet).toBeNull();
  });
  it('ignores a stale network success when a newer check fails', async () => {
    const pending = deferred<{ onTestnet: boolean; passphrase: string }>();
    const { result } = renderHook(useWallet);
    vi.mocked(checkWalletNetwork).mockReturnValueOnce(pending.promise).mockRejectedValueOnce(new Error('offline'));
    let run!: Promise<boolean>;
    await act(async () => { run = result.current.refreshNetwork(); expect(await result.current.refreshNetwork()).toBe(false); });
    await act(async () => { pending.resolve({ onTestnet: true, passphrase: 'fixture' }); expect(await run).toBe(false); });
    expect(result.current.onTestnet).toBe(false);
  });
  it('does not read the network after a connection resolves following unmount', async () => {
    const pending = deferred<string>();
    vi.mocked(connectWallet).mockReturnValue(pending.promise);
    const { result, unmount } = renderHook(useWallet);
    let run!: Promise<void>;
    act(() => { run = result.current.connect(); });
    unmount();
    pending.resolve('synthetic address');
    await run;
    expect(checkWalletNetwork).not.toHaveBeenCalled();
  });
  it('catches restore failures without an unhandled rejection', async () => {
    vi.mocked(rememberedAddress).mockRejectedValue(new Error('chunk unavailable'));
    const { result } = renderHook(useWallet);
    await act(async () => { await Promise.resolve(); });
    expect(result.current.onTestnet).toBe(false);
  });
});

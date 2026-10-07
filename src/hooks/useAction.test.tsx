// @vitest-environment happy-dom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAction } from './useAction';

afterEach(cleanup);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe('useAction', () => {
  it('returns no value from a task abandoned by unmount', async () => {
    const { result, unmount } = renderHook(() => useAction<number>());
    const pending = deferred<number>();
    let run!: Promise<number | undefined>;
    act(() => { run = result.current.run(() => pending.promise); });
    unmount();
    pending.resolve(1);
    expect(await run).toBeUndefined();
  });

  it('clears a previous success when a new action starts', async () => {
    const { result } = renderHook(() => useAction<number>());
    await act(async () => { await result.current.run(async () => 1); });
    const pending = deferred<number>();
    let run!: Promise<number | undefined>;
    act(() => { run = result.current.run(() => pending.promise); });
    expect(result.current.result).toBeNull();
    await act(async () => { pending.resolve(2); await run; });
    expect(result.current.result).toBe(2);
  });

  it('handles rejection after unmount without publishing an error', async () => {
    const { result, unmount } = renderHook(() => useAction<number>());
    const pending = deferred<number>();
    let run!: Promise<number | undefined>;
    act(() => { run = result.current.run(() => pending.promise); });
    unmount();
    pending.reject(new Error('abandoned failure'));
    expect(await run).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
  it('blocks same-turn submissions until the first task settles', async () => {
    const { result } = renderHook(() => useAction<number>());
    const pending = deferred<number>();
    const duplicate = vi.fn(async () => 2);
    let run!: Promise<number | undefined>;
    await act(async () => {
      run = result.current.run(() => pending.promise);
      expect(await result.current.run(duplicate)).toBeUndefined();
    });
    expect(duplicate).not.toHaveBeenCalled();
    expect(result.current.busy).toBe(true);
    await act(async () => { pending.resolve(1); expect(await run).toBe(1); });
    expect(result.current.result).toBe(1);
    expect(result.current.busy).toBe(false);
  });

  it('invalidates a reset result without allowing a concurrent task', async () => {
    const { result } = renderHook(() => useAction<number>());
    const pending = deferred<number>();
    const duplicate = vi.fn(async () => 2);
    let run!: Promise<number | undefined>;
    act(() => { run = result.current.run(() => pending.promise); });
    act(() => result.current.reset());
    expect(result.current.busy).toBe(true);
    await act(async () => { expect(await result.current.run(duplicate)).toBeUndefined(); });
    expect(duplicate).not.toHaveBeenCalled();
    await act(async () => { pending.resolve(1); expect(await run).toBeUndefined(); });
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.busy).toBe(false);
    await act(async () => { expect(await result.current.run(async () => 3)).toBe(3); });
    expect(result.current.result).toBe(3);
  });

  it('ignores failures from a reset task and releases the busy guard', async () => {
    const { result } = renderHook(() => useAction<number>());
    const pending = deferred<number>();
    let run!: Promise<number | undefined>;
    act(() => { run = result.current.run(() => pending.promise); });
    act(() => result.current.reset());
    await act(async () => { pending.reject(new Error('Old lookup failed')); await run; });
    expect(result.current.error).toBeNull();
    expect(result.current.busy).toBe(false);
    await act(async () => { await result.current.run(async () => { throw new Error('Current failure'); }); });
    expect(result.current.error?.message).toBe('Current failure');
  });
});

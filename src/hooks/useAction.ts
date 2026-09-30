import { useCallback, useState } from 'react';

import { describeContractError, type MappedError } from '../lib/contractErrors';

export interface ActionState<T> {
  readonly busy: boolean;
  readonly error: MappedError | null;
  readonly result: T | null;
  run: (task: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

/**
 * Runs an async task and exposes `busy / error / result` for the UI. Every
 * failure is passed through `describeContractError`, so contract codes always
 * arrive as the reviewed wording from `ERRORS.md`.
 */
export function useAction<T>(): ActionState<T> {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MappedError | null>(null);
  const [result, setResult] = useState<T | null>(null);

  const run = useCallback(async (task: () => Promise<T>) => {
    setBusy(true);
    setError(null);
    try {
      setResult(await task());
    } catch (thrown) {
      setResult(null);
      setError(describeContractError(thrown));
    } finally {
      setBusy(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return { busy, error, result, run, reset };
}

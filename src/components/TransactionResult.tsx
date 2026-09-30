import { explorerTxUrl, shorten } from '../lib/explorer';

/**
 * Shown after every action that produced a transaction: the full hash and a
 * link to the explorer. The hash is the receipt — without it there is nothing
 * to check afterwards.
 */
export function TransactionResult({
  hash,
  explorerBaseUrl,
  label = 'Transaction submitted',
}: {
  hash: string;
  explorerBaseUrl: string;
  label?: string;
}) {
  const url = explorerTxUrl(explorerBaseUrl, hash);

  return (
    <div className="notice notice-ok">
      <p className="notice-title">{label}</p>
      <p className="mono">
        <span className="hint">Hash: </span>
        <span title={hash}>{shorten(hash, 10)}</span>
      </p>
      <p>
        <a href={url} target="_blank" rel="noreferrer noopener">
          Open it in the explorer
        </a>
      </p>
    </div>
  );
}

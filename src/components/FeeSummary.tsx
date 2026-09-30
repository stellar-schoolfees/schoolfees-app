import { formatAmount } from '../lib/amount';
import { formatDateTime } from '../lib/datetime';
import { explorerContractUrl, shorten } from '../lib/explorer';
import { remaining, type FeeRecord, type FeeStatus } from '../lib/fee';
import { bytesToHex, formatReference } from '../lib/reference';
import { StatusBadge } from './StatusBadge';

/**
 * Everything the contract stores for a fee, plus the two values the app derives
 * (`net` and `remaining`). Nothing is hidden: amounts and dates on this screen
 * are public on-chain, and showing them plainly is the point of the record.
 */
export function FeeSummary({
  fee,
  status,
  explorerBaseUrl,
}: {
  fee: FeeRecord;
  status: FeeStatus;
  explorerBaseUrl: string;
}) {
  return (
    <section className="card" aria-labelledby="fee-summary-heading">
      <h2 id="fee-summary-heading">
        Fee #{fee.id.toString()} <StatusBadge status={status} />
      </h2>

      <dl className="summary">
        <div>
          <dt>Total</dt>
          <dd className="mono">{formatAmount(fee.total)}</dd>
        </div>
        <div>
          <dt>Paid so far</dt>
          <dd className="mono">{formatAmount(fee.paidTotal)}</dd>
        </div>
        <div>
          <dt>Refunded</dt>
          <dd className="mono">{formatAmount(fee.refundedTotal)}</dd>
        </div>
        <div>
          <dt>Still owed</dt>
          <dd className="mono">{formatAmount(remaining(fee))}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{formatDateTime(fee.dueAt)}</dd>
        </div>
        <div>
          <dt>Closed</dt>
          <dd>{fee.closed ? 'Yes' : 'No'}</dd>
        </div>
        <div>
          <dt>School</dt>
          <dd className="mono" title={fee.school}>
            {shorten(fee.school, 8)}
          </dd>
        </div>
        <div>
          <dt>Token</dt>
          <dd className="mono" title={fee.token}>
            <a
              href={explorerContractUrl(explorerBaseUrl, fee.token)}
              target="_blank"
              rel="noreferrer noopener"
            >
              {shorten(fee.token, 8)}
            </a>
          </dd>
        </div>
        <div>
          <dt>Reference</dt>
          <dd className="mono" title={bytesToHex(fee.reference)}>
            {formatReference(bytesToHex(fee.reference))}
          </dd>
        </div>
      </dl>

      <p className="hint">
        Amounts are in the token&rsquo;s smallest unit and this app does not convert decimal
        places. &ldquo;Still owed&rdquo; is computed by the app as total minus paid plus refunded.
      </p>
    </section>
  );
}

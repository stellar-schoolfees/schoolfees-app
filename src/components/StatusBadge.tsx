import { describeStatus, type FeeStatus } from '../lib/fee';

const TONE: Record<FeeStatus, string> = {
  Open: 'tone-open',
  Paid: 'tone-paid',
  Overdue: 'tone-overdue',
  Closed: 'tone-closed',
  Unknown: 'tone-unknown',
};

export function StatusBadge({ status }: { status: FeeStatus }) {
  return (
    <span className={`badge ${TONE[status]}`} title={describeStatus(status)}>
      {status}
    </span>
  );
}

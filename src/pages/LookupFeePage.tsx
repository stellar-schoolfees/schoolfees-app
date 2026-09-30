import { useState } from 'react';

import { ConnectPrompt } from '../components/ConnectPrompt';
import { ErrorNotice } from '../components/ErrorNotice';
import { FeeSummary } from '../components/FeeSummary';
import { Field } from '../components/Field';
import { useAction } from '../hooks/useAction';
import type { FeeRecord, FeeStatus } from '../lib/fee';
import { validateFeeId } from '../lib/validation';
import type { PageProps } from './shared';

interface LoadedFee {
  readonly fee: FeeRecord;
  readonly status: FeeStatus;
}

/**
 * Looks a fee up by id and shows everything stored for it, plus its status.
 * Read-only: nothing here can change a record.
 */
export function LookupFeePage({ client, config, wallet }: PageProps) {
  const [feeId, setFeeId] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const action = useAction<LoadedFee>();

  if (wallet.address === null) {
    return (
      <section>
        <h1>View a fee</h1>
        <ConnectPrompt wallet={wallet} />
      </section>
    );
  }

  const address = wallet.address;

  async function load() {
    const check = validateFeeId(feeId);
    if (!check.ok) {
      setFieldError(check.message);
      return;
    }
    setFieldError(null);

    await action.run(async () => {
      const fee = await client.getFee(address, check.value);
      const status = await client.getStatus(address, check.value);
      return { fee, status };
    });
  }

  return (
    <section>
      <h1>View a fee</h1>
      <p>
        Enter the fee id the school gave you. This asks the contract directly, so what you see is
        what is recorded on-chain.
      </p>

      <Field
        id="feeId"
        label="Fee id"
        value={feeId}
        onChange={setFeeId}
        inputMode="numeric"
        placeholder="1"
        required
        hint="Fee ids start at 1."
        error={fieldError}
      />

      <button type="button" onClick={() => void load()} disabled={action.busy}>
        {action.busy ? 'Loading…' : 'Look up the fee'}
      </button>

      {action.error !== null && <ErrorNotice error={action.error} />}

      {action.result !== null && (
        <FeeSummary
          fee={action.result.fee}
          status={action.result.status}
          explorerBaseUrl={config.explorerBaseUrl}
        />
      )}
    </section>
  );
}

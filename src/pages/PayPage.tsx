import { useState } from 'react';

import { ConnectPrompt } from '../components/ConnectPrompt';
import { ErrorNotice } from '../components/ErrorNotice';
import { FeeSummary } from '../components/FeeSummary';
import { Field } from '../components/Field';
import { TransactionResult } from '../components/TransactionResult';
import { useAction } from '../hooks/useAction';
import { parsePositiveAmount } from '../lib/amount';
import { CONTRACT_ERRORS } from '../lib/contractErrors';
import { remaining, type FeeRecord, type FeeStatus } from '../lib/fee';
import { runWrite } from '../lib/flow';
import { validateFeeId } from '../lib/validation';
import type { PageProps } from './shared';

interface LoadedFee {
  readonly fee: FeeRecord;
  readonly status: FeeStatus;
}

// Wording comes from ERRORS.md via the mapping module; never retyped here.
const FEE_CLOSED_MESSAGE = CONTRACT_ERRORS[10]?.message ?? 'This fee is closed.';
const OVERPAYMENT_MESSAGE = CONTRACT_ERRORS[31]?.message ?? 'That is more than the amount still owed.';

/**
 * Pays toward a fee. The tokens leave the connected wallet and go straight to
 * the school: the contract only records what happened.
 */
export function PayPage({ client, config, wallet }: PageProps) {
  const [feeId, setFeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [feeIdError, setFeeIdError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const load = useAction<LoadedFee>();
  const pay = useAction<{ hash: string }>();

  if (wallet.address === null) {
    return (
      <section>
        <h1>Pay a fee</h1>
        <ConnectPrompt wallet={wallet} />
      </section>
    );
  }

  const address = wallet.address;
  const loaded = load.result;

  async function lookup() {
    const check = validateFeeId(feeId);
    if (!check.ok) {
      setFeeIdError(check.message);
      return;
    }
    setFeeIdError(null);
    setAmountError(null);
    pay.reset();

    await load.run(async () => {
      const fee = await client.getFee(address, check.value);
      const status = await client.getStatus(address, check.value);
      // Prefill the amount with what is still owed; the payer can lower it.
      setAmount(remaining(fee).toString());
      return { fee, status };
    });
  }

  async function submit() {
    if (loaded === null) return;

    const amountCheck = parsePositiveAmount(amount);
    if (!amountCheck.ok) {
      setAmountError(amountCheck.message);
      return;
    }
    if (amountCheck.value > remaining(loaded.fee)) {
      setAmountError(OVERPAYMENT_MESSAGE);
      return;
    }
    setAmountError(null);

    await pay.run(async () => {
      const result = await runWrite(client, address, config.passphrase, () =>
        client.preparePay({
          source: address,
          feeId: loaded.fee.id,
          payer: address,
          amount: amountCheck.value,
        }),
      );
      return { hash: result.hash };
    });
  }

  return (
    <section>
      <h1>Pay a fee</h1>
      <p>
        Anyone can pay, in as many installments as they like. Payment after the due date is allowed:
        &ldquo;overdue&rdquo; is information, not a lock.
      </p>

      <Field
        id="payFeeId"
        label="Fee id"
        value={feeId}
        onChange={setFeeId}
        inputMode="numeric"
        placeholder="1"
        required
        error={feeIdError}
      />

      <button type="button" onClick={() => void lookup()} disabled={load.busy}>
        {load.busy ? 'Loading…' : 'Look up the fee'}
      </button>

      {load.error !== null && <ErrorNotice error={load.error} />}

      {loaded !== null && (
        <>
          <FeeSummary fee={loaded.fee} status={loaded.status} explorerBaseUrl={config.explorerBaseUrl} />

          {loaded.fee.closed ? (
            <div className="notice" role="note">
              <p>{FEE_CLOSED_MESSAGE}</p>
            </div>
          ) : (
            <fieldset disabled={pay.busy}>
              <legend>Payment</legend>
              <Field
                id="payAmount"
                label="Amount to pay now"
                value={amount}
                onChange={setAmount}
                inputMode="numeric"
                required
                hint={`Still owed: ${remaining(loaded.fee).toString()}. A whole number in the token's smallest unit.`}
                error={amountError}
              />
              <button type="button" onClick={() => void submit()}>
                Sign and pay
              </button>
            </fieldset>
          )}
        </>
      )}

      {pay.error !== null && <ErrorNotice error={pay.error} />}
      {pay.result !== null && (
        <TransactionResult hash={pay.result.hash} explorerBaseUrl={config.explorerBaseUrl} label="Payment submitted" />
      )}
    </section>
  );
}

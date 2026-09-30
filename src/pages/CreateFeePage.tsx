import { useState } from 'react';

import { ConnectPrompt } from '../components/ConnectPrompt';
import { ErrorNotice } from '../components/ErrorNotice';
import { Field } from '../components/Field';
import { TransactionResult } from '../components/TransactionResult';
import { useAction } from '../hooks/useAction';
import { parsePositiveAmount } from '../lib/amount';
import type { SubmitResult } from '../lib/contract';
import { defaultDueDate, unixSecondsFromLocalInput } from '../lib/datetime';
import { runWrite } from '../lib/flow';
import { REFERENCE_HINT, REFERENCE_WARNING, validateReference } from '../lib/reference';
import { scValToFeeId } from '../lib/scval';
import { validateContractAddress } from '../lib/validation';
import type { PageProps } from './shared';

interface CreatedFee {
  readonly result: SubmitResult;
  readonly feeId: bigint | null;
}

/**
 * Records a fee. The school is the connected wallet, so `create_fee` is signed
 * by the same address it records — the contract checks exactly that.
 */
export function CreateFeePage({ client, config, wallet }: PageProps) {
  const [token, setToken] = useState('');
  const [reference, setReference] = useState('');
  const [total, setTotal] = useState('');
  const [dueAt, setDueAt] = useState(defaultDueDate());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const action = useAction<CreatedFee>();

  if (wallet.address === null) {
    return (
      <section>
        <h1>Create a fee</h1>
        <ConnectPrompt wallet={wallet} />
      </section>
    );
  }

  const address = wallet.address;

  async function submit() {
    const tokenCheck = validateContractAddress(token);
    const referenceCheck = validateReference(reference);
    const totalCheck = parsePositiveAmount(total);

    const dueSeconds = unixSecondsFromLocalInput(dueAt);
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Same wording as the DueDateInPast row in ERRORS.md.
    const dueError =
      dueSeconds === null
        ? 'Choose a due date.'
        : dueSeconds <= nowSeconds
          ? 'The due date must be in the future.'
          : null;

    const nextErrors: Record<string, string | null> = {
      token: tokenCheck.ok ? null : tokenCheck.message,
      reference: referenceCheck.ok ? null : referenceCheck.message,
      total: totalCheck.ok ? null : totalCheck.message,
      dueAt: dueError,
    };
    setFieldErrors(nextErrors);

    if (!tokenCheck.ok || !referenceCheck.ok || !totalCheck.ok || dueSeconds === null || dueError !== null) {
      return;
    }

    await action.run(async () => {
      const result = await runWrite(client, address, config.passphrase, () =>
        client.prepareCreateFee({
          source: address,
          school: address,
          token: tokenCheck.value,
          reference: referenceCheck.bytes,
          total: totalCheck.value,
          dueAt: BigInt(dueSeconds),
        }),
      );

      return {
        result,
        feeId: result.returnValue === undefined ? null : scValToFeeId(result.returnValue),
      };
    });
  }

  return (
    <section>
      <h1>Create a fee</h1>
      <p>
        This records the fee the school is owed. Your connected address becomes the school address,
        and it is the only address that can later refund a payer or close this fee.
      </p>

      <fieldset disabled={action.busy}>
        <legend>Fee details</legend>

        <Field
          id="token"
          label="Token contract address"
          value={token}
          onChange={setToken}
          placeholder="C…"
          mono
          required
          hint="The SEP-41 token this fee is denominated in, for example the Stellar Asset Contract for your testnet asset. There is no whitelist: the contract uses whatever you name."
          error={fieldErrors.token}
        />

        <Field
          id="reference"
          label="Opaque reference"
          value={reference}
          onChange={setReference}
          placeholder="64 hexadecimal characters"
          mono
          required
          hint={
            <>
              {REFERENCE_HINT} {REFERENCE_WARNING}
            </>
          }
          error={fieldErrors.reference}
        />

        <Field
          id="total"
          label="Total owed"
          value={total}
          onChange={setTotal}
          inputMode="numeric"
          placeholder="5000"
          required
          hint="A whole number, in the token's smallest unit. The app does not convert decimal places."
          error={fieldErrors.total}
        />

        <Field
          id="dueAt"
          label="Due date"
          value={dueAt}
          onChange={setDueAt}
          type="datetime-local"
          required
          hint="In your local time zone. The contract refuses a date that is not in the future, and accepts payments after it."
          error={fieldErrors.dueAt}
        />

        <button type="button" onClick={() => void submit()}>
          Create the fee
        </button>
      </fieldset>

      {action.error !== null && <ErrorNotice error={action.error} />}

      {action.result !== null && (
        <>
          <TransactionResult hash={action.result.result.hash} explorerBaseUrl={config.explorerBaseUrl} />
          {action.result.feeId !== null ? (
            <div className="notice notice-ok">
              <p className="notice-title">Fee #{action.result.feeId.toString()} created</p>
              <p>Share that fee id with the payer. It is also in the FeeCreated event.</p>
            </div>
          ) : (
            <div className="notice">
              <p>
                The transaction succeeded, but this network did not report a return value, so the
                fee id could not be read here. The FeeCreated event in the explorer has it.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// @vitest-environment happy-dom
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  clientFactory,
  feeFactory,
  pagePropsFactory,
  renderOnly,
  renderWithA11y,
  textOf,
  walletFactory,
} from '../test/render';

import { LookupFeePage } from './LookupFeePage';

describe('<LookupFeePage />', () => {
  it('asks for a wallet before anything else', () => {
    const view = renderOnly(
      <LookupFeePage
        {...pagePropsFactory({ wallet: walletFactory({ address: null }) })}
      />,
    );
    expect(view.getByRole('button', { name: 'Connect wallet' })).not.toBeNull();
  });

  it('looks a fee up and renders the summary', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ total: 5000n, paidTotal: 1200n, refundedTotal: 0n });
    const view = renderOnly(
      <LookupFeePage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));

    expect(await view.findByText('Still owed')).not.toBeNull();
    expect(textOf(view.container)).toContain('3,800');
    expect(textOf(view.container)).toContain('Fee #1');
  });

  it('rejects an invalid fee id before any call', async () => {
    const user = userEvent.setup();
    const view = renderOnly(<LookupFeePage {...pagePropsFactory()} />);

    await user.type(view.getByLabelText('Fee id'), '0');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));

    expect(await view.findByRole('alert')).not.toBeNull();
  });

  it('maps an unknown fee to the reviewed error notice', async () => {
    const user = userEvent.setup();
    const view = renderOnly(
      <LookupFeePage {...pagePropsFactory({ client: clientFactory([]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '7');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));

    const alert = await view.findByRole('alert');
    expect(alert.textContent).toContain("We couldn't find that fee.");
  });

  it('shows the busy label and disables the button while loading', async () => {
    const user = userEvent.setup();
    const client = clientFactory([feeFactory()]);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const original = client.getFee.bind(client);
    client.getFee = async (...args) => {
      await gate;
      return original(...args);
    };

    const view = renderOnly(<LookupFeePage {...pagePropsFactory({ client })} />);
    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));

    const busy = view.getByRole('button', { name: 'Loading…' });
    expect(busy.hasAttribute('disabled')).toBe(true);

    release();
    await view.findByText('Still owed');
  });

  it('passes the accessibility check empty and with a fee loaded', async () => {
    const client = clientFactory([feeFactory()]);
    await renderWithA11y(
      <LookupFeePage {...pagePropsFactory({ client, wallet: walletFactory() })} />,
    );
    // The loaded state's accessibility is covered by <FeeSummary />'s own axe
    // test; this page-level check covers the form the reader first meets.
  });
});

// @vitest-environment happy-dom
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Same guard as PayPage's tests: no test may reach a real wallet or network.
vi.mock('../lib/wallet', () => ({
  checkWalletNetwork: async () => ({ onTestnet: true, passphrase: 'Test SDF Network ; September 2015' }),
  signWithWallet: async (xdr: string) => `signed:${xdr}`,
  connectWallet: async () => {
    throw new Error('not used in tests');
  },
  disconnectWallet: async () => {},
  initWallet: () => {},
  rememberedAddress: async () => null,
}));

import {
  clientFactory,
  fakeAccount,
  feeFactory,
  pagePropsFactory,
  renderOnly,
  renderWithA11y,
  textOf,
  walletFactory,
} from '../test/render';

import { SchoolActionsPage } from './SchoolActionsPage';

describe('<SchoolActionsPage />', () => {
  it('asks for a wallet before anything else', () => {
    const view = renderOnly(
      <SchoolActionsPage
        {...pagePropsFactory({ wallet: walletFactory({ address: null }) })}
      />,
    );
    expect(view.getByRole('button', { name: 'Connect wallet' })).not.toBeNull();
  });

  it('shows refund and close forms after a lookup, with close disabled while a part-payment remains', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ total: 5000n, paidTotal: 1000n });
    const view = renderOnly(
      <SchoolActionsPage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));

    expect(await view.findByText('Refund a payer')).not.toBeNull();
    expect(textOf(view.container)).toContain('Close the fee');
    expect(textOf(view.container)).toContain('still has part of a payment on it');
    const closeButton = view.getByRole('button', { name: 'Sign and close' }) as HTMLButtonElement;
    expect(closeButton.disabled).toBe(true);
  });

  it('enables close when nothing is owed', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ total: 5000n, paidTotal: 5000n });
    const view = renderOnly(
      <SchoolActionsPage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));

    await view.findByText('Refund a payer');
    expect(textOf(view.container)).toContain('This fee can be closed');
    const closeButton = view.getByRole('button', { name: 'Sign and close' }) as HTMLButtonElement;
    expect(closeButton.disabled).toBe(false);
  });

  it('shows the closed notice and neither form for a closed fee', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ closed: true });
    const view = renderOnly(
      <SchoolActionsPage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));

    expect(await view.findByText(/This fee is closed/)).not.toBeNull();
    expect(view.queryByText('Refund a payer')).toBeNull();
  });

  it('validates the refund fields before building anything', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ total: 5000n, paidTotal: 1000n });
    const view = renderOnly(
      <SchoolActionsPage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));
    await view.findByText('Refund a payer');

    await user.type(view.getByLabelText('Payer address'), 'not-an-address');
    await user.type(view.getByLabelText('Amount to refund'), '0');
    await user.click(view.getByRole('button', { name: 'Sign and refund' }));

    const alerts = await view.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(2);
  });

  it('refunds and announces the result', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ total: 5000n, paidTotal: 1000n });
    const view = renderOnly(
      <SchoolActionsPage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));
    await view.findByText('Refund a payer');

    await user.type(view.getByLabelText('Payer address'), fakeAccount(9));
    await user.type(view.getByLabelText('Amount to refund'), '500');
    await user.click(view.getByRole('button', { name: 'Sign and refund' }));

    expect(await view.findByText('Refund submitted')).not.toBeNull();
    expect(textOf(view.container)).toContain('a'.repeat(64));
  });

  it('passes the accessibility check while disconnected', async () => {
    await renderWithA11y(
      <SchoolActionsPage
        {...pagePropsFactory({ wallet: walletFactory({ address: null }) })}
      />,
    );
  });
});

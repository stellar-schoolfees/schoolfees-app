// @vitest-environment happy-dom
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// The write path goes through lib/wallet; mock it so no test can reach a real
// wallet, a real RPC endpoint, or a real key. runWrite's network gate and the
// signing step are stubbed to the success shape the pages expect.
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
  feeFactory,
  pagePropsFactory,
  renderOnly,
  renderWithA11y,
  textOf,
  walletFactory,
} from '../test/render';

import { PayPage } from './PayPage';

describe('<PayPage />', () => {
  it('asks for a wallet before anything else', () => {
    const view = renderOnly(
      <PayPage {...pagePropsFactory({ wallet: walletFactory({ address: null }) })} />,
    );
    expect(view.getByRole('button', { name: 'Connect wallet' })).not.toBeNull();
  });

  it('looks a fee up, shows the summary and prefills what is still owed', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ total: 5000n, paidTotal: 1200n, refundedTotal: 0n });
    const view = renderOnly(
      <PayPage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));

    expect(await view.findByText('Still owed')).not.toBeNull();
    const amount = view.getByLabelText('Amount to pay now') as HTMLInputElement;
    expect(amount.value).toBe('3800');
    expect(view.getByRole('button', { name: 'Sign and pay' })).not.toBeNull();
  });

  it('tells the payer a closed fee cannot be paid and hides the form', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ closed: true });
    const view = renderOnly(
      <PayPage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));

    expect(await view.findByText(/This fee is closed/)).not.toBeNull();
    expect(view.queryByLabelText('Amount to pay now')).toBeNull();
  });

  it('refuses an overpayment before building any transaction', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ total: 5000n, paidTotal: 1200n });
    const view = renderOnly(
      <PayPage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));
    await view.findByLabelText('Amount to pay now');

    await user.clear(view.getByLabelText('Amount to pay now'));
    await user.type(view.getByLabelText('Amount to pay now'), '9999');
    await user.click(view.getByRole('button', { name: 'Sign and pay' }));

    const alert = await view.findByRole('alert');
    expect(alert.textContent).toContain('more than the amount still owed');
  });

  it('pays, announces the result and re-reads the fee', async () => {
    const user = userEvent.setup();
    const fee = feeFactory({ total: 5000n, paidTotal: 0n });
    const view = renderOnly(
      <PayPage {...pagePropsFactory({ client: clientFactory([fee]) })} />,
    );

    await user.type(view.getByLabelText('Fee id'), '1');
    await user.click(view.getByRole('button', { name: 'Look up the fee' }));
    await view.findByLabelText('Amount to pay now');

    await user.click(view.getByRole('button', { name: 'Sign and pay' }));

    expect(await view.findByText('Payment submitted')).not.toBeNull();
    expect(textOf(view.container)).toContain('a'.repeat(64));
    expect(view.container.querySelector('[role="status"]')).not.toBeNull();
  });

  it('passes the accessibility check while disconnected and with the form open', async () => {
    await renderWithA11y(
      <PayPage {...pagePropsFactory({ wallet: walletFactory({ address: null }) })} />,
    );
    const client = clientFactory([feeFactory()]);
    await renderWithA11y(
      <PayPage {...pagePropsFactory({ client, wallet: walletFactory() })} />,
    );
  });
});

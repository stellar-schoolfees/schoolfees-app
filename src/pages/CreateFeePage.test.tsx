// @vitest-environment happy-dom
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// No test may reach a real wallet or network.
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
  fakeContractId,
  pagePropsFactory,
  renderOnly,
  renderWithA11y,
  textOf,
  walletFactory,
} from '../test/render';

import { u64ToScVal } from '../lib/scval';
import { CreateFeePage } from './CreateFeePage';

const TOKEN = fakeContractId(7);
const REFERENCE = 'ab'.repeat(32); // 64 hexadecimal characters, synthetic.

describe('<CreateFeePage />', () => {
  it('asks for a wallet before anything else', () => {
    const view = renderOnly(
      <CreateFeePage
        {...pagePropsFactory({ wallet: walletFactory({ address: null }) })}
      />,
    );
    expect(view.getByRole('button', { name: 'Connect wallet' })).not.toBeNull();
  });

  it('reports every validation failure before building a transaction', async () => {
    const user = userEvent.setup();
    const view = renderOnly(<CreateFeePage {...pagePropsFactory()} />);

    await user.click(view.getByRole('button', { name: 'Create the fee' }));

    const alerts = await view.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(3); // token, reference, total
    expect(view.queryByText('Transaction submitted')).toBeNull();
  });

  it('creates a fee, announces it, and reads back the fee id', async () => {
    const user = userEvent.setup();
    const client = clientFactory([]);
    client.submit = async () => ({
      hash: 'b'.repeat(64),
      returnValue: u64ToScVal(5n),
    });
    const view = renderOnly(
      <CreateFeePage {...pagePropsFactory({ client })} />,
    );

    await user.type(view.getByLabelText('Token contract address'), TOKEN);
    await user.type(view.getByLabelText('Opaque reference'), REFERENCE);
    await user.type(view.getByLabelText('Total owed'), '5000');
    await user.click(view.getByRole('button', { name: 'Create the fee' }));

    expect(await view.findByText('Transaction submitted')).not.toBeNull();
    expect(textOf(view.container)).toContain('Fee #5 created');
    expect(view.container.querySelectorAll('[role="status"]').length).toBeGreaterThanOrEqual(1);
  });

  it('says honestly when the network reports no return value', async () => {
    const user = userEvent.setup();
    const client = clientFactory([]); // submit returns a hash only
    const view = renderOnly(
      <CreateFeePage {...pagePropsFactory({ client })} />,
    );

    await user.type(view.getByLabelText('Token contract address'), TOKEN);
    await user.type(view.getByLabelText('Opaque reference'), REFERENCE);
    await user.type(view.getByLabelText('Total owed'), '5000');
    await user.click(view.getByRole('button', { name: 'Create the fee' }));

    expect(await view.findByText('Transaction submitted')).not.toBeNull();
    expect(textOf(view.container)).toContain('did not report a return value');
  });

  it('passes the accessibility check while disconnected and with the form open', async () => {
    await renderWithA11y(
      <CreateFeePage
        {...pagePropsFactory({ wallet: walletFactory({ address: null }) })}
      />,
    );
    await renderWithA11y(<CreateFeePage {...pagePropsFactory()} />);
  });
});

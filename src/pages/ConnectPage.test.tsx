// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import {
  configFactory,
  pagePropsFactory,
  renderOnly,
  renderWithA11y,
  textOf,
  walletFactory,
} from '../test/render';

import { ConnectPage } from './ConnectPage';

describe('<ConnectPage />', () => {
  it('renders the landing heading and truthful prototype scope', () => {
    const view = renderOnly(
      <ConnectPage {...pagePropsFactory({ wallet: walletFactory() })} />,
    );
    const text = textOf(view.container);
    expect(text).toContain('Pay school fees');
    expect(text).toContain('Still a prototype.');
    expect(text).toContain('No pilot has happened');
    expect(text).toContain('synthetic testnet contract demonstration is deployed');
    expect(text).toContain('Browser wallet business flows still need verification');
  });

  it('shows the recorded contract id and leaves wallet controls in the shell', () => {
    const config = configFactory();
    const view = renderOnly(
      <ConnectPage {...pagePropsFactory({ config, wallet: walletFactory() })} />,
    );
    expect(textOf(view.container)).toContain(`Contract: ${config.contractId}`);
    expect(view.queryByRole('button', { name: 'Disconnect' })).toBeNull();
  });

  it('directs users to the header without duplicating the connect control', () => {
    const view = renderOnly(
      <ConnectPage
        {...pagePropsFactory({ wallet: walletFactory({ address: null }) })}
      />,
    );
    expect(view.queryByRole('button', { name: 'Connect wallet' })).toBeNull();
    expect(textOf(view.container)).toContain('Connect wallet in the workspace header');
  });

  it('passes the accessibility check connected and disconnected', async () => {
    await renderWithA11y(
      <ConnectPage {...pagePropsFactory({ wallet: walletFactory() })} />,
    );
    await renderWithA11y(
      <ConnectPage
        {...pagePropsFactory({ wallet: walletFactory({ address: null }) })}
      />,
    );
  });
});

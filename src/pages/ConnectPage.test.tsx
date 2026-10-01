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
  it('renders the heading and the honest not-happened-yet card', () => {
    const view = renderOnly(
      <ConnectPage {...pagePropsFactory({ wallet: walletFactory() })} />,
    );
    const text = textOf(view.container);
    expect(text).toContain('Pay school fees');
    expect(text).toContain('What has not happened yet');
    expect(text).toContain('No pilot has happened');
    expect(text).toContain('no flow here has been exercised end to end yet');
  });

  it('shows the connected wallet and the recorded contract id', () => {
    const config = configFactory();
    const view = renderOnly(
      <ConnectPage {...pagePropsFactory({ config, wallet: walletFactory() })} />,
    );
    expect(textOf(view.container)).toContain(`Contract: ${config.contractId}`);
    expect(view.getByRole('button', { name: 'Disconnect' })).not.toBeNull();
  });

  it('shows the connect prompt before a wallet is connected', () => {
    const view = renderOnly(
      <ConnectPage
        {...pagePropsFactory({ wallet: walletFactory({ address: null }) })}
      />,
    );
    expect(
      view.getAllByRole('button', { name: 'Connect wallet' }).length,
    ).toBeGreaterThan(0); // one in the wallet bar, one in the prompt
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

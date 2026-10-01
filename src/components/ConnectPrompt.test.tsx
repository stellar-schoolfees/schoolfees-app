// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { renderOnly, renderWithA11y, textOf, walletFactory } from '../test/render';

import { ConnectPrompt } from './ConnectPrompt';

describe('<ConnectPrompt />', () => {
  it('offers a connect button that is enabled while idle', () => {
    const view = renderOnly(<ConnectPrompt wallet={walletFactory()} />);
    const button = view.getByRole('button', { name: 'Connect wallet' });
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('disables the button and renames it while connecting', () => {
    const view = renderOnly(
      <ConnectPrompt wallet={walletFactory({ connecting: true })} />,
    );
    const button = view.getByRole('button', { name: 'Connecting…' });
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('says plainly that no secret key is requested', () => {
    const view = renderOnly(<ConnectPrompt wallet={walletFactory()} />);
    const text = textOf(view.container);
    expect(text).toContain('never');
    expect(text).toContain('secret key');
  });

  it('passes the accessibility check', async () => {
    await renderWithA11y(<ConnectPrompt wallet={walletFactory()} />);
  });
});

// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { renderOnly, renderWithA11y, textOf } from '../test/render';

import { TestnetBanner } from './TestnetBanner';

describe('<TestnetBanner />', () => {
  it('renders the TESTNET tag and the no-real-money wording', () => {
    const view = renderOnly(<TestnetBanner />);
    const text = textOf(view.container);
    expect(text).toContain('TESTNET');
    expect(text).toContain('no real money');
  });

  it('exposes a polite live region so the banner is announced', () => {
    const view = renderOnly(<TestnetBanner />);
    const region = view.container.querySelector('[role="status"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-live')).toBe('polite');
  });

  it('passes the accessibility check', async () => {
    await renderWithA11y(<TestnetBanner />);
  });
});

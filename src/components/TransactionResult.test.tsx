// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { renderOnly, renderWithA11y, textOf } from '../test/render';

import { TransactionResult } from './TransactionResult';

const HASH = 'ab'.repeat(32); // 64 hex characters, synthetic.

describe('<TransactionResult />', () => {
  it('shows the shortened hash, the label and an explorer link', () => {
    const view = renderOnly(
      <TransactionResult
        hash={HASH}
        explorerBaseUrl="https://example.testexplorer.invalid"
        label="Payment submitted"
      />,
    );
    const text = textOf(view.container);
    expect(text).toContain('Payment submitted');
    expect(text).toContain('Hash:');
    expect(text).toContain('…');
    const link = view.getByRole('link', { name: 'Open it in the explorer' });
    expect(link.getAttribute('href')).toBe(
      `https://example.testexplorer.invalid/tx/${HASH}`,
    );
  });

  it('keeps the full hash available as sr-only text, not only as a tooltip', () => {
    // A11Y-05: title alone is unreachable on touch devices and unreliable in
    // screen readers, so the full value is asserted in the accessible text.
    const view = renderOnly(
      <TransactionResult hash={HASH} explorerBaseUrl="https://example.testexplorer.invalid" />,
    );
    expect(textOf(view.container)).toContain(HASH);
  });

  it('announces the result as a polite status region', () => {
    // A11Y-06: the hash is the receipt; an unannounced success invites a
    // repeated payment.
    const view = renderOnly(
      <TransactionResult hash={HASH} explorerBaseUrl="https://example.testexplorer.invalid" />,
    );
    expect(view.container.querySelector('[role="status"]')).not.toBeNull();
  });

  it('passes the accessibility check', async () => {
    await renderWithA11y(
      <TransactionResult hash={HASH} explorerBaseUrl="https://example.testexplorer.invalid" />,
    );
  });
});

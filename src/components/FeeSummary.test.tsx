// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import {
  feeFactory,
  renderOnly,
  renderWithA11y,
  textOf,
} from '../test/render';

import { FeeSummary } from './FeeSummary';

const EXPLORER = 'https://example.testexplorer.invalid';

describe('<FeeSummary />', () => {
  it('shows the derived values: still owed, paid, refunded', () => {
    const fee = feeFactory({ total: 5000n, paidTotal: 1200n, refundedTotal: 200n });
    const view = renderOnly(
      <FeeSummary fee={fee} status="Open" explorerBaseUrl={EXPLORER} />,
    );
    const text = textOf(view.container);
    expect(text).toContain('Still owed');
    expect(text).toContain('4,000'); // total − paid + refunded, with separators
    expect(text).toContain('1,200');
    expect(text).toContain('200');
    expect(text).toContain('5,000');
  });

  it('shows the fee id, the badge and the closed flag', () => {
    const fee = feeFactory({ closed: true });
    const view = renderOnly(
      <FeeSummary fee={fee} status="Closed" explorerBaseUrl={EXPLORER} />,
    );
    const text = textOf(view.container);
    expect(text).toContain('Fee #1');
    expect(text).toContain('Closed');
    expect(text).toContain('Yes');
  });

  it('explains the status visibly without requiring hover', () => {
    const view = renderOnly(
      <FeeSummary fee={feeFactory()} status="Overdue" explorerBaseUrl={EXPLORER} />,
    );
    const explanation = view.container.querySelector('h2 + p');
    expect(explanation?.textContent).toContain('Payments are still accepted.');
    expect(explanation?.classList.contains('sr-only')).toBe(false);
  });

  it('keeps full school and token addresses in the accessible text', () => {
    // A11Y-05: the full values are sr-only text now, not tooltip-only.
    const fee = feeFactory();
    const view = renderOnly(
      <FeeSummary fee={fee} status="Open" explorerBaseUrl={EXPLORER} />,
    );
    expect(textOf(view.container)).toContain(fee.school);
    expect(textOf(view.container)).toContain(fee.token);
    const tokenLink = view.container.querySelector('a[href*="/contract/"]');
    expect(tokenLink?.getAttribute('href')).toBe(`${EXPLORER}/contract/${fee.token}`);
  });

  it('shows the full reference in the accessible text', () => {
    const fee = feeFactory();
    const view = renderOnly(
      <FeeSummary fee={fee} status="Open" explorerBaseUrl={EXPLORER} />,
    );
    const hex = Array.from(fee.reference, (b) => b.toString(16).padStart(2, '0')).join('');
    expect(textOf(view.container)).toContain(hex);
  });

  it('never renders the fake addresses as the visible short form only', () => {
    const fee = feeFactory();
    const view = renderOnly(
      <FeeSummary fee={fee} status="Open" explorerBaseUrl={EXPLORER} />,
    );
    const text = textOf(view.container);
    expect(text).toContain(fee.school.slice(0, 8));
    expect(text).toContain('Full address');
  });

  it('passes the accessibility check', async () => {
    const fee = feeFactory();
    await renderWithA11y(
      <FeeSummary fee={fee} status="Open" explorerBaseUrl={EXPLORER} />,
    );
  });
});

// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { renderOnly, renderWithA11y, textOf } from '../test/render';

import { StatusBadge } from './StatusBadge';

describe('<StatusBadge />', () => {
  it('shows the bare status word visually', () => {
    const view = renderOnly(<StatusBadge status="Open" />);
    expect(textOf(view.container)).toContain('Open');
  });

  it('carries the full description as sr-only text and as a title', () => {
    const view = renderOnly(<StatusBadge status="Overdue" />);
    expect(textOf(view.container)).toContain(
      'The due date has passed and a balance is still owed. Payments are still accepted.',
    );
    const badge = view.container.querySelector('.badge');
    expect(badge?.getAttribute('title')).toContain('due date has passed');
  });

  it('describes Unknown honestly', () => {
    const view = renderOnly(<StatusBadge status="Unknown" />);
    expect(textOf(view.container)).toContain('does not recognise');
  });

  it('passes the accessibility check', async () => {
    await renderWithA11y(<StatusBadge status="Paid" />);
  });
});

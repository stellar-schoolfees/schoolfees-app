// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { describeContractError } from '../lib/contractErrors';
import { renderOnly, renderWithA11y, textOf } from '../test/render';

import { ErrorNotice } from './ErrorNotice';

describe('<ErrorNotice />', () => {
  it('shows the mapped wording for a known contract code', () => {
    // FeeClosed is code 10 in ERRORS.md.
    const view = renderOnly(
      <ErrorNotice error={describeContractError('Error(Contract, #10)')} />,
    );
    const text = textOf(view.container);
    expect(text).toContain('This fee is closed');
    expect(text).toContain('Contract error code: 10');
  });

  it('shows the generic wording for a code that is not in ERRORS.md', () => {
    const view = renderOnly(
      <ErrorNotice error={describeContractError('Error(Contract, #99)')} />,
    );
    expect(textOf(view.container)).toContain(
      'Something went wrong (contract error code 99). Please report this.',
    );
  });

  it('renders as an assertive alert region', () => {
    const view = renderOnly(
      <ErrorNotice error={describeContractError(new Error('boom'))} />,
    );
    expect(view.container.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('passes the accessibility check', async () => {
    await renderWithA11y(
      <ErrorNotice error={describeContractError('Error(Contract, #10)')} />,
    );
  });
});

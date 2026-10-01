// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { renderOnly, renderWithA11y } from '../test/render';

import { Field } from './Field';

describe('<Field />', () => {
  it('labels the input through htmlFor and wires the hint', () => {
    const view = renderOnly(
      <Field
        id="amount"
        label="Amount to pay now"
        value=""
        onChange={() => {}}
        hint="A whole number in the smallest unit."
      />,
    );
    const input = view.getByLabelText('Amount to pay now') as HTMLInputElement;
    expect(input.id).toBe('amount');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe('amount-hint');
    expect(document.getElementById('amount-hint')?.textContent).toContain(
      'A whole number',
    );
  });

  it('marks errors with aria-invalid, role=alert and describedby', () => {
    const view = renderOnly(
      <Field id="fee" label="Fee id" value="" onChange={() => {}} error="Enter a fee id." />,
    );
    const input = view.getByLabelText('Fee id') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('fee-error');
    const alert = document.getElementById('fee-error');
    expect(alert?.getAttribute('role')).toBe('alert');
    expect(alert?.textContent).toBe('Enter a fee id.');
  });

  it('disables the input when asked', () => {
    const view = renderOnly(
      <Field id="x" label="X" value="1" onChange={() => {}} disabled />,
    );
    expect((view.getByLabelText('X') as HTMLInputElement).disabled).toBe(true);
  });

  it('passes the accessibility check with hint and error present', async () => {
    await renderWithA11y(
      <Field
        id="ref"
        label="Opaque reference"
        value=""
        onChange={() => {}}
        hint="64 hexadecimal characters."
        error="Enter the reference."
      />,
    );
  });
});

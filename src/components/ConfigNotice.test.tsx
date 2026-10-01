// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { renderOnly, renderWithA11y, textOf } from '../test/render';

import { ConfigNotice } from './ConfigNotice';

const PROBLEMS = [
  'VITE_STELLAR_NETWORK is not set.',
  'VITE_CONTRACT_ID is not set.',
];

describe('<ConfigNotice />', () => {
  it('renders the heading and every environment problem', () => {
    const view = renderOnly(<ConfigNotice problems={PROBLEMS} />);
    const text = textOf(view.container);
    expect(text).toContain('This app is not configured yet');
    for (const problem of PROBLEMS) {
      expect(text).toContain(problem);
    }
  });

  it('says where the contract id must come from', () => {
    const view = renderOnly(<ConfigNotice problems={PROBLEMS} />);
    expect(textOf(view.container)).toContain('pilot');
  });

  it('passes the accessibility check', async () => {
    await renderWithA11y(<ConfigNotice problems={PROBLEMS} />);
  });
});

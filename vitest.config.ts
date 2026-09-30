import { defineConfig } from 'vitest/config';

// Unit tests cover the pure functions in `src/lib/` only. Nothing here touches
// the network, a wallet, or the DOM.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

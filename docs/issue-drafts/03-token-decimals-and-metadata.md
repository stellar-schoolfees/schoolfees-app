# Show amounts in human units

**Difficulty:** medium
**Labels:** help wanted, area:app

## Problem

Amounts are entered and displayed as raw integers in the token's smallest unit,
with a note telling the user that the app does not convert decimal places. That
is honest but unfriendly: a school thinking in units has to do the arithmetic
itself, and a miscounted zero is an easy mistake on a fee record that cannot be
edited.

## Scope

Read the token's decimals (for example from the Stellar Asset Contract's
metadata, or from configuration the maintainer supplies) and format amounts for
display, while still sending raw `i128` values to the contract.

Out of scope: guessing a decimals value when it cannot be read. If it cannot be
determined, keep the current raw-integer behaviour and say so on screen.

## Acceptance criteria

- [ ] Amounts are shown in human units when decimals are known, and as raw integers when they are not.
- [ ] Parsing a human-typed decimal amount is exact — no floating-point rounding anywhere (unit tests).
- [ ] The value sent to the contract is still a whole `i128` in the token's smallest unit.
- [ ] The screen states which unit is being shown.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass.

## Where to start

`src/lib/amount.ts` and its test, `src/components/FeeSummary.tsx`,
`src/pages/CreateFeePage.tsx`, `src/pages/PayPage.tsx`. The contract's amount
handling is in `src/fee.rs` in `schoolfees-contracts`.

## How to test

```bash
npm test
```

Add unit tests for exact conversion in both directions, including a value with
the maximum sensible number of decimal places.

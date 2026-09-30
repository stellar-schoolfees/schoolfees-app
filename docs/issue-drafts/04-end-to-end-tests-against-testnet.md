# End-to-end tests against testnet

**Difficulty:** medium
**Labels:** help wanted, area:ci

## Problem

Every unit test in this repo runs offline against pure functions. Nothing has
ever exercised the real path: build a transaction, simulate it, sign it with a
wallet, submit it, and read the record back. The contract client, the ScVal
conversions and the status parsing are therefore all *assumed* correct rather
than proven, and a breaking change in the SDK would only be noticed by hand.

## Scope

Add an automated end-to-end test that runs the full fee lifecycle against
**testnet** with a funded test account: create a fee, pay it in two
installments, read it back, refund, close. Run it in CI only when the contract
id and a test account are configured, and skip (not fail) otherwise.

Out of scope: mainnet, real identities, or storing any key in the repository.
Secrets come from CI secrets or are not present at all.

## Acceptance criteria

- [ ] The test creates, reads, pays, refunds and closes a fee on testnet and asserts the status at each step.
- [ ] It skips cleanly when the contract id or account is not configured, rather than failing CI.
- [ ] No secret key, seed phrase or contract id is hardcoded or committed.
- [ ] A failure names the step and links the transaction on the explorer.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass.

## Where to start

`src/lib/contract.ts` is the code under test; `src/lib/flow.ts` shows the write
path. The lifecycle rules are in `docs/design/interface-v0.md` and the error
codes in `ERRORS.md` in `schoolfees-contracts`.

## How to test

```bash
npm test
```

Then configure a funded testnet identity in CI and confirm the end-to-end test
runs and passes there.

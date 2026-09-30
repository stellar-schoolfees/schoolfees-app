# Restore an archived fee record

**Difficulty:** hard
**Labels:** help wanted, area:app

## Problem

Soroban persists entries with a time to live. A fee nobody touches can archive
after roughly `due_at + 30 days` (a 30-day settlement margin over the due date,
with a 7-day floor — `src/storage.rs` in `schoolfees-contracts`). Today the app
detects an archived record and refuses with a plain message: there is no way to
bring the record back from the UI, and the contract has no public entrypoint
whose job is to extend or restore a record's TTL. A pilot school that comes back
late would be stuck.

## Scope

- Work out what the real SDK offers: check whether simulation reports a restore
  preamble and whether the existing `assembleTransaction` path in
  `src/lib/contract.ts` can include the restoration operation, or whether a
  separate restore step is needed. Verify against the installed
  `@stellar/stellar-sdk`, not from memory.
- Provide a clear path in the app: detect the archived state, explain it, and
  offer an explicit restore action that the connected wallet signs.
- Add the contract-side support only if the SDK path requires it — coordinate
  with `07-extend-ttl-entrypoint.md` in `schoolfees-contracts`.

Out of scope: changing the TTL policy, restoring anything without the user's
explicit action, and any mainnet work.

## Acceptance criteria

- [ ] A unit test covers the archived/restore-needed simulation shape with a fixture taken from the real SDK types.
- [ ] The app never builds a restore silently: the user sees what will be restored and signs it.
- [ ] Success and failure of the restore are both shown with the transaction hash and an explorer link.
- [ ] The error mapping keeps the generic fallback for codes not in `ERRORS.md`, and any new user-facing wording is added to `ERRORS.md` in `schoolfees-contracts` first, then re-copied into `docs/contract-errors.md`.
- [ ] The README's "proven vs assumed" section says exactly which parts were exercised and which still need a deployed contract.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass.

## Where to start

`src/lib/contract.ts` (the archived-record refusal and the
build → simulate → assemble → submit path), `src/lib/scval.ts`, and the
Soroban RPC docs on state archival at developers.stellar.org. Read `AGENTS.md`
for the no-deploy and honesty rules; the testnet-only rule still applies.

## How to test

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Then, only after a real deployment exists, archive an entry on testnet, restore
it from the app, and record the transaction link in the pilot notes. Until then
the restore path stays marked unverified.

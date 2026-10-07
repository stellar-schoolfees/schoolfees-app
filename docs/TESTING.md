# Testing - schoolfees app

## Local evidence (2026-10-07)

Node 24.19.0, committed package lock with no dependency changes. `npm run lint`
and `npm run typecheck` passed. The final full suite passed: **26 files,
168 tests**, 187.94 seconds, using `npm test -- --maxWorkers=1` to avoid
contention with other projects on this machine. No timeout was increased.
The earlier normal parallel run passed 166 tests before two final regressions
were added; the final single-worker run includes both.
Current build sizes and evidence are recorded in [PRODUCTION_QUALITY.md](PRODUCTION_QUALITY.md).
These results describe the current working tree; no new GitHub CI result is claimed.

```bash
npm run lint
npm run typecheck
npm test -- --maxWorkers=1
npm run build
```

## Coverage

Pure-function tests cover amount/reference/date/id validation, configuration and
network refusal, fee maths/status, canonical contract errors, explorer URLs and
round-trips against real SDK ScVal encoders. Component and page tests use the
`src/test/render.tsx` fixtures with automated axe checks. The harness includes a
broken-label control proving the accessibility check can fail.

`useAction.test.tsx` exercises same-turn duplicate calls, reset before success
and failure, holding the guard until settlement, new-action result clearing and
unmount before completion. `useWallet.test.tsx` exercises duplicate connect,
late restore/connect/network after disconnect, late connect after unmount,
newer network failure overriding an old success and rejected restore.

Page tests mock the wallet and contract client. Synthetic addresses and hashes
are fixtures, never deployment evidence. The cross-repo error-table comparison
runs when sibling `schoolfees-contracts` exists and skips in standalone CI.

## Limits

No deployed contract, real wallet connection/signature, testnet transaction,
RPC failure capture, browser network capture, screen-reader audit or end-to-end
pilot has been exercised. The synchronous guard covers one hook, not another
tab or on-chain idempotency. Automated axe in happy-dom does not establish WCAG
conformance, browser contrast, focus behaviour or 320px/390px reflow.

Reads simulate transactions and do not persist TTL extension. Archived records
cannot be restored by this app. Routing, translations, token decimals and fee
lists remain unimplemented; see [../ROADMAP.md](../ROADMAP.md).

## Human pilot smoke test

Only after a real school agrees and the maintainer deploys on testnet:

1. Check the TESTNET banner, configuration refusal and wrong-network refusal.
2. Connect and reconnect a real wallet; cancel a signing prompt and inspect the error.
3. Create, read, partially pay, refund and close a fee using synthetic references.
4. Match hashes and record data against the testnet explorer. Check an uncertain
   transaction before manually retrying; never resend blindly.
5. Double-click an action and confirm exactly one transaction from that page.
6. Check keyboard focus, the skip link, status announcements, 320px and 390px
   layouts, 200% zoom and reduced motion in a real browser.
7. Record actual commit, URL, hashes, browser and observed results. Do not label
   any step passed before it has run.

## Adding tests

Keep pure logic beside its tests in `src/lib`. Use deferred promises for lifecycle
regressions and the existing axe render harness for UI. Changes to `ERRORS.md`
require updating the vendored table and checking both mapping directions. Never
weaken network/privacy refusals or increase timeouts to mask a failing test.

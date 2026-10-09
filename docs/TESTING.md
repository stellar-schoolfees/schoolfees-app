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

## October 9, 2026 landing and workspace redesign

Local checks passed: lint, strict typecheck, all 168 tests across 26 files, and production build. Main JavaScript chunk: 804.47 kB (189.72 kB gzip); CSS: 14.81 kB (3.93 kB gzip). The existing 500 kB chunk warning remains. No dependency, wallet adapter, RPC client, network-validation or contract method was changed.

Offline Chromium production fixtures passed 29 scenes at 320, 390, 768 and 1440px, plus a 1280px CSS 200% zoom simulation. Scenes cover landing, expanded disclosure, primary/secondary hover, disconnected payer entry, mocked-connected create, local validation errors, loaded payer and school records. No horizontal overflow or axe WCAG 2/2.1/2.2 violations was found. Rendered solid-background text contrast was at least 5.56:1 after transitions settled; disabled controls were excluded. All measured buttons and disclosures were at least 44px high. Decorative SVG gradients were inspected visually; they carry no text. Keyboard skip-link, page-change focus, no initial focus movement under StrictMode, and reduced-motion behavior passed.

The connected address and fee state in these screenshots are injected mock fixtures, not a connected real wallet or on-chain result. Network requests were blocked outside the local fixture server. No transaction was signed or submitted. Native browser-toolbar zoom, real-device testing, screen readers, the wallet provider dialog and signed browser business flows remain unverified. Source snapshots, computed styles, before/after screenshots, diffs and machine-readable results are retained in the workspace submission packet; they are not evidence of an independent accessibility or security audit.

Eleven additional synthetic CSS-class probes passed for error/confirmation notices, supporting text, nested code and all status tones (7.07:1–14.73:1). These are styling probes, not submitted transaction outcomes.

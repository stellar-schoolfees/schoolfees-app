# Guard against a duplicate transaction submission

**Status: implemented locally.** Implemented locally on 2026-10-07 with deferred hook regressions. Cross-tab and on-chain idempotency remain out of scope.

The original draft below is historical scope, not current missing behaviour.

**Difficulty:** easy
**Labels:** good first issue, area:app

## Problem

Double submission is currently prevented **only by the disabled button**. Every
action sits inside a `<fieldset disabled={busy}>` (or the button itself is
disabled while busy), and `useAction` sets `busy` before awaiting — but
`useAction.run` has **no re-entry guard of its own**: no in-flight ref, no request
generation counter, nothing that rejects a second call. It relies entirely on
React flushing `busy` and re-rendering before another click event can be handled.

Two ways around that:

- a second invocation from anywhere other than the click path (a keyboard repeat,
  a future keyboard shortcut, a retry wrapper added later), and
- a second browser tab, which has its own React state.

A duplicate `pay` is not harmless: the contract has no idempotency key, so a
second payment is a second real payment (it succeeds unless it overpays, and then
fails with `Overpayment`). The one repeat the contract does block is
`create_fee` with a reference already used (`DuplicateReference`, 32).

## Scope

- Add an in-flight guard to `useAction.run` (a `busyRef` and/or a generation
  counter) so a second `run` while one is in flight is ignored, and make the
  guard unit-testable.
- Keep the existing `busy`/`error`/`result` surface unchanged for the UI.
- Say plainly, in `docs/SECURITY.md` §6 and `docs/TESTING.md` §3, what is now
  guarded and what is still not (a second tab; there is no on-chain idempotency).

Out of scope: on-chain idempotency or a transaction-nonce scheme (the contract
has none and adding one is a contract change), any automatic resend, and a
storage-based cross-tab lock.

## Acceptance criteria

- [ ] A second `run()` while one is in flight does not start a second task.
- [ ] The guard is covered by a unit test that calls `run()` twice with an
      overlapping promise and asserts the task ran once.
- [ ] Existing busy/disabled behaviour and error mapping are unchanged.
- [ ] `docs/SECURITY.md` §6 states accurately what is and is not guarded.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass.

## Where to start

`src/hooks/useAction.ts` (the whole file is 42 lines). `src/pages/PayPage.tsx`
shows the call site. The reasoning is already written up in `docs/SECURITY.md` §6.

## How to test

```bash
npm test
```

Then, once a contract is deployed, double-click "Sign and pay" and confirm exactly
one transaction appears for the fee.

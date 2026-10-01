# Bound RPC retries and timeouts

**Difficulty:** medium
**Labels:** help wanted, area:app

## Problem

`src/lib/contract.ts` makes exactly one attempt per RPC call — `getAccount`,
`simulateTransaction`, `sendTransaction`, `pollTransaction` — with **no explicit
timeout of its own** and **no retry**. On a flaky mobile connection the user gets
one raw failure and no second chance; `TRY_AGAIN_LATER` is reported as "the
network is busy. Please try again in a moment." and then the flow ends. Nothing
in the app says which calls are safe to repeat and which are not.

This matters more than a cosmetic error, because the safe and unsafe calls are
different: **re-reading is safe, re-sending is not.** A retry loop over
`sendTransaction` would be how a duplicate payment happens.

## Scope

Add explicit, bounded behaviour:

- A **timeout** per RPC call, and a **bounded retry with backoff** for the
  idempotent calls only: `getAccount`, `simulateTransaction`, and a *poll* of a
  known transaction hash.
- **Never** auto-retry `sendTransaction`. If the outcome is unknown, keep the
  current behaviour: surface the hash and tell the user to check before retrying.
- Keep the retry logic in a pure, dependency-free helper in `src/lib/` with unit
  tests, so it can be tested without a network.
- Keep the reviewed `ERRORS.md` wording for contract errors; a retry exhaustion is
  not a contract error and must not borrow a code.

Out of scope: a queue, background resubmission, offline support, any new
dependency (write the backoff by hand), and any change to the contract.

## Acceptance criteria

- [ ] Every RPC call in `src/lib/contract.ts` goes through a bounded helper with an explicit timeout.
- [ ] A read/simulate/poll call retries at most N times with increasing delay, and the limit is a named constant with a comment.
- [ ] `sendTransaction` is never retried automatically, and a comment says why.
- [ ] The helper is unit tested, including: success after a failure, exhaustion, and that a retry is never attempted for a non-idempotent call.
- [ ] The user-visible behaviour on exhaustion is a clear message, with no invented error code.
- [ ] `docs/SECURITY.md` §5 §6 and `docs/TESTING.md` §3 are updated — the rows that currently say "missing" become accurate.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass.

## Where to start

`src/lib/contract.ts` (`buildTransaction`, `assemble`, `read`, `submit`),
`src/hooks/useAction.ts` for the busy/error surface, and `docs/SECURITY.md` §5 for
the requirements this must satisfy. `src/lib/contractErrors.ts` shows the house
style for a pure, unit-tested module.

## How to test

```bash
npm test
```

Then simulate a flaky endpoint (an unreachable RPC URL in `.env.local`) and
confirm the app waits, retries a bounded number of times, and finally reports a
message a person can act on.

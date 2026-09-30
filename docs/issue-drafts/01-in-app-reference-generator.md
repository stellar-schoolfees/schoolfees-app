# Generate the opaque reference in the app

**Difficulty:** easy
**Labels:** good first issue, area:app

## Problem

Creating a fee requires a 64-hex-character (32-byte) opaque reference. Today the
school has to produce that value somewhere else, which means the privacy rule —
"never put a name, phone number or student id on-chain" — depends on a step
outside the app. `docs/design/interface-v0.md` section 3.5 says the app is meant
to hash an off-chain identifier before calling the contract.

## Scope

Add an optional "create a reference from my internal id" action on the create-fee
page: take a school-chosen internal string and hash it with SHA-256
(`crypto.subtle.digest`), then fill the reference field with the resulting hex.

Out of scope: storing the internal id anywhere, sending it anywhere, or changing
the contract. The internal string must never leave the browser, and the screen
must say so.

## Acceptance criteria

- [ ] The button produces a 64-character hex value that passes `validateReference`.
- [ ] Hashes are stable: the same input always produces the same reference (unit test).
- [ ] The internal string is never persisted, logged or sent in any payload.
- [ ] The screen keeps the plain-words warning that names, phone numbers and student ids must not be entered — including in the internal-id field.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass.

## Where to start

`src/pages/CreateFeePage.tsx`, `src/lib/reference.ts` and its test. Read the
privacy rules in `AGENTS.md` and section 3.5 of the contract interface draft.

## How to test

```bash
npm test
```

Add a unit test asserting the same input hashes to the same 32 bytes, and that
the output passes `validateReference`.

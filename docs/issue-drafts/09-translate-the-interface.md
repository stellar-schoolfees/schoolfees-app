# Translate the interface

**Difficulty:** medium
**Labels:** help wanted, area:app

## Problem

The app is English-only, and its readers are school staff and parents, not
developers. `limitations.md` in `schoolfees-docs` lists translations as not
built. A pilot with people who are not fluent in English would fail for reasons
that have nothing to do with the contract.

## Scope

- Extract the user-facing strings from the components and pages into one module.
- Add a language switch with at least one language besides English, chosen with a
  real speaker of that language rather than guessed.
- Keep the contract's error wording mapped through `src/lib/contractErrors.ts`
  (the translated text must not drift from the meaning of the `ERRORS.md`
  message; the English text stays the reference).

Out of scope: right-to-left layout support (record it as a follow-up if the
chosen language needs it), automatic translation services, and any change to
`ERRORS.md` itself.

## Acceptance criteria

- [ ] No user-facing string is hardcoded in `src/components/` or `src/pages/`.
- [ ] A language switch exists, persists the choice, and defaults to English.
- [ ] The translation was reviewed by a speaker of that language, and the review is recorded (who, when, which file) — not invented.
- [ ] Error messages keep the `ERRORS.md` meaning; a test fails if a translated message is missing.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass.

## Where to start

`src/components/` and `src/pages/` for the strings, `src/lib/contractErrors.ts`
for the error wording, and the `AGENTS.md` rule that error wording comes from
`ERRORS.md`. Keep `bigint` amounts and addresses out of translation.

## How to test

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Then switch language in the running app and check every page, including the
configuration notice and the error notices.

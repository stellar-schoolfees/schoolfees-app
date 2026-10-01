# Remove the unused `mapContractError` export

**Difficulty:** easy
**Labels:** good first issue, area:app

## Problem

`src/lib/contractErrors.ts` exports `mapContractError(error): string`, a
convenience wrapper that returns `describeContractError(error).message`. Nothing
in the app calls it:

```
$ grep -rn "mapContractError" src/
src/lib/contractErrors.ts:158:export function mapContractError(error: unknown): string {
```

Only the definition itself matches — no component, page, hook or test uses it.
Its companion, `describeContractError`, is the one the app actually uses (through
`src/hooks/useAction.ts`), and it returns more information (`nextAction`, `code`).

Dead code in a module whose whole job is to be the single, trusted source of error
wording is a small liability: a future contributor may reach for the half-featured
wrapper and lose the suggested next action and the error code that
`ErrorNotice` renders.

## Scope

Delete the unused export, or — if it is deliberately kept as public API — add a
test and a comment saying who is meant to call it and why.

Out of scope: changing any user-visible wording (`ERRORS.md` remains the source of
truth), and any other refactor in `contractErrors.ts`.

## Acceptance criteria

- [ ] `mapContractError` is either removed, or used by something and covered by a
      test.
- [ ] `grep -rn "mapContractError" src/` returns no dangling reference after removal.
- [ ] Every message still comes from `CONTRACT_ERRORS` and is still checked
      against `docs/contract-errors.md` by the existing tests.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass.

## Where to start

`src/lib/contractErrors.ts` (the export is at the end of the module),
`src/hooks/useAction.ts` and `src/components/ErrorNotice.tsx` for how errors are
actually surfaced. `AGENTS.md` has the rule that error wording is never invented
in this repo.

## How to test

```bash
grep -rn "mapContractError" src/
npm run lint && npm run typecheck && npm test && npm run build
```

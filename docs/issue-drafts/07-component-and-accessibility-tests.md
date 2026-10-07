# Add component and accessibility tests

**Status: partly implemented.** Component/page render tests and automated axe
checks exist. Screen-reader and real-browser keyboard/zoom audits remain open.
The original draft below records the broader scope.

**Difficulty:** medium
**Labels:** help wanted, area:app

## Problem

Only pure logic is unit tested. `src/components/` and `src/pages/` have no
render tests, so a broken prop, a missing label or a page that throws on a
malformed fee record would pass every check. Accessibility is built in
(labels, landmarks, focus styles, `aria-describedby`), but no screen-reader or
keyboard audit has been done, and nothing in CI would notice it regressing.
The README states both gaps; this draft closes them.

## Scope

Add render tests for the components and the five pages with a DOM test
environment, covering at least: the TESTNET banner on every screen, the
configuration notice when `.env` is invalid, error notices for a known and an
unknown contract code, the fee summary's derived values (`remaining`, status
badge), and the disabled/busy states of each form. Add an automated
accessibility check to those tests.

Out of scope: a full manual screen-reader audit (that stays a human task, and
should be recorded when done), end-to-end tests against a network (draft 04),
and any visual-regression tooling.

## Acceptance criteria

- [x] A rendering test environment is configured and `npm test` runs both the existing pure tests and the new render tests.
- [x] Every component in `src/components/` has at least one test, and each of the five pages in `src/pages/` has at least a render test.
- [x] An automated accessibility check runs over the rendered pages and fails on serious violations.
- [x] Tests use fake addresses and synthetic references only — no personal data, and no real contract ids or hashes.
- [x] CI still runs `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and no test touches the network.
- [x] The README's "proven vs assumed" section is updated to say what is now tested, and the accessibility line is corrected to match what the automated check really covers.

## Where to start

`vitest.config.ts` (add a jsdom or happy-dom environment for the render tests),
`src/components/Field.tsx` and `src/pages/PayPage.tsx` as the first targets.
`AGENTS.md` has the no-secrets and no-personal-data rules; the README section
"What is proven vs assumed" shows the honesty standard for the final wording.

## How to test

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Then break a label deliberately and confirm the accessibility check fails.

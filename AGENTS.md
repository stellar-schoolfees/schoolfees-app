# AGENTS.md

## Authorized hosted frontend demonstration - October 9, 2026

The maintainer authorized agent-managed Vercel hosting and a premium landing-page
and workspace redesign for the existing synthetic testnet demonstration.
The hosted app is https://schoolfees-testnet.vercel.app.
This narrow authorization overrides older human-only frontend hosting rules
for this work; real-pilot requirements and testnet-only safeguards remain.
Browser-wallet business flows have not yet been validated. The hosted frontend
and verified contract demonstration do not establish a real-school pilot.

## Authorized contract demonstration — October 8, 2026

The maintainer explicitly authorized a synthetic testnet contract demonstration.
Its deployment is verified; see the [contract record](https://github.com/stellar-schoolfees/schoolfees-contracts/blob/main/docs/TESTNET_DEMONSTRATION.md).
Real-pilot partner gates remain in force. The app has not completed a real-wallet
business-flow test. Earlier blanket “not deployed” statements refer to the state
before this narrow exception.

Rules for any AI agent working in this repository (`schoolfees-app`). Read this file at the start of every task.

## Project context
`schoolfees` is a Stellar/Soroban project with three repos: `schoolfees-contracts` (Rust contract), `schoolfees-app` (this repo, a small web app) and `schoolfees-docs` (mdBook docs). It is built by one person, will be public and open to outside contributors. Testnet only. Pilot users are real people (school or tutorial centre staff and parents) and are not developers.

**Never put student names, phone numbers, or IDs on-chain. Opaque references or hashes only.**

**Pilot rule:** no schoolfees contract is deployed until a real school or tutorial centre has agreed to try it. Deploying and setting the contract id are the human's steps.

## Source of truth

Read these before changing anything, in this order:

1. `README.md` — what the app does, and its "What is proven vs assumed" section.
2. `docs/SECURITY.md` — wallet rules, network safety, validation, RPC failure handling,
   duplicate submission, dependency review.
3. `docs/TESTING.md` — what is unit tested, and what is **not** tested.
4. `docs/DESIGN_GUIDELINES.md` — visual direction, tokens, components, and known deviations.
5. `docs/ACCESSIBILITY.md` — the WCAG 2.2 AA baseline and its honest gaps.
6. `docs/DEPLOYMENT_CHECKLIST.md` — the release gate, including what is left to the human.
7. `docs/PRODUCTION_QUALITY.md` — metadata, favicon, bundle, source maps, deferred SEO.
8. `docs/RESOURCES.md` — every dependency with its licence, and the `npm audit` result.
9. `docs/contract-errors.md` — the vendored copy of the contract's `ERRORS.md` table.
10. `ROADMAP.md` and `docs/decisions/` — what is next, and decisions already made.

System-level design lives in the docs repo (`schoolfees-docs/src/architecture.md`); link to
it, never restate it here. Error wording comes from the contract repo's `ERRORS.md` and is
never written in this repo.

## Collaboration rules

- **Lead with the result or the next action.** Say what happened or what you need first;
  detail comes after.
- **Call out incorrect assumptions plainly.** If a premise in the task is wrong, say so in one
  sentence and continue with what is true.
- **Ask before anything destructive, legal, security-related, payment-related or
  irreversible.** Do not guess on a high-stakes decision: record it as a question for the
  human and carry on with the rest.
- **Honest completion report.** Before saying done, state what you tested, what you did **not**
  test, and any defect you found. "It works" without evidence is a liability, not a signal.
- Do not invent requirements, and do not add scope beyond the task.

## Toolchain (re-check on developers.stellar.org before relying on any version)
- Node 24 locally. Package manager: use whatever the scaffold uses; do not mix managers.
- Preferred start: the current Scaffold Stellar init flow. If it is not available as documented, fall back to Vite + React + TypeScript with the Stellar SDK and Stellar Wallets Kit, and record the decision in `docs/decisions/`.
- Checks before finishing any task: lint, type-check, unit tests, production build.
- Never use the old `soroban` CLI or `stellar contract test`.

## App rules
- Wallets sign; the app NEVER asks for, stores or logs a secret key or seed phrase.
- Always show a visible "TESTNET - no real money" banner and refuse to operate on any other network.
- Read the network and contract id from `.env` values only, via `src/config.ts`. Never hardcode contract ids, addresses or keys.
- Map contract errors to plain-language messages. The source of truth is the "user-facing message" column of `ERRORS.md` in `schoolfees-contracts`. Do not invent different wording. If a code is missing from that table, show a generic message and add `TODO(verify)`.
- Show the transaction hash and an explorer link after every action.
- Mobile-first and accessible. No analytics, trackers or third-party scripts. No backend in v0.
- No student personal data may appear in any payload that reaches the chain. Reference fields accept opaque references only, and the UI must validate and say so plainly.

## Structure
- `src/config.ts`: network + contract id from `.env` only.
- `src/lib/`: pure functions (formatting, reference validation, contract-error to message mapping) with unit tests.
- `src/components/` and `src/pages/`: UI only, no business logic that belongs in `lib/`.
- `.env.example` documents variables with placeholder values. `.env` is never committed.
- `scripts/deploy-testnet.sh` may be written but NEVER run by an agent.

## TypeScript rules
- Strict mode. No `any` without a comment explaining why.
- Include `.gitignore` (node_modules/, dist/, .env, .stellar/, *.key), README, CONTRIBUTING.md, ROADMAP.md and CI (`.github/workflows/web.yml`: lint, type-check, build).

## Commit rules

- One logical change per commit. Never bundle unrelated changes.
- Never create empty or filler commits.
- Every commit must pass this repository's checks (lint, type-check, unit tests and the production build).
- Conventional format: `type: imperative summary`, where `type` is one of `feat`, `fix`,
  `docs`, `chore`, `test`, `refactor`, `style` or `perf`.
- Subject line: 72 characters or fewer, in the imperative mood. No trailing period.
- Stage files by explicit name. **Never** `git add -A` or `git add .`.
- Run `git status` and read the staged diff (`git diff --staged`) before every commit. Do not
  commit a file you did not intend to change.
- Never commit `.env` contents, key material, a secret, or a secret-looking string. If you see
  one in a diff, stop and say so.
- Do not rewrite history.
- Never add a "Generated with Codebuff" trailer or any co-author trailer to commit messages.

## Safety rules
- Testnet only. Never mainnet.
- NEVER read, print, log, commit, or ask for secret keys, seed phrases or `.env` contents.
- Do NOT deploy, push, change git remotes, create GitHub issues, install tools, run `sudo`, or pipe downloads into a shell. Write scripts and stop; the human runs them.
- Do not add dependencies without saying why, and check the package (maintainer, recent releases) first.

## Truthfulness and evidence rules
- Never invent function names, flags, or package APIs. If unsure, read developers.stellar.org or the package docs. If you still cannot verify, write `TODO(verify)` and list it in your final summary.
- Docs and UI text must describe only what the code does. Anything not built is marked "Not implemented yet".
- Never invent contract addresses, transaction hashes, users, testers, quotes, or pilot outcomes.
- When using a real third-party project as inspiration for structure, never copy its name, branding, figures or claims.

## Scope rules
- Build v0 only. Do NOT implement items listed as unimplemented in the task; record them in `ROADMAP.md`.
- Write each unimplemented item as a draft in `docs/issue-drafts/NN-title.md` using the template below. Do not create issues on GitHub.
- Do not add scope beyond what the task asks. A working v0 with honest limitations beats a half-working v1.

## Issue draft template
    # Title (imperative, specific)
    **Difficulty:** easy | medium | hard
    **Labels:** good first issue | help wanted | area:<contracts|app|docs|ci>
    ## Problem
    What is missing or wrong, and why it matters.
    ## Scope
    What to change. What is explicitly out of scope.
    ## Acceptance criteria
    - [ ] Checkable statements (tests pass, docs updated, behavior X).
    ## Where to start
    Files or functions, and the docs to read.
    ## How to test
    Exact commands.

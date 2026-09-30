# AGENTS.md

Rules for any AI agent working in this repository (`schoolfees-app`). Read this file at the start of every task.

## Project context
`schoolfees` is a Stellar/Soroban project with three repos: `schoolfees-contracts` (Rust contract), `schoolfees-app` (this repo, a small web app) and `schoolfees-docs` (mdBook docs). It is built by one person, will be public and open to outside contributors. Testnet only. Pilot users are real people (school or tutorial centre staff and parents) and are not developers.

**Never put student names, phone numbers, or IDs on-chain. Opaque references or hashes only.**

**Pilot rule:** no schoolfees contract is deployed until a real school or tutorial centre has agreed to try it. Deploying and setting the contract id are the human's steps.

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
- Small commits with clear messages. Do not rewrite history.

## Safety rules
- Testnet only. Never mainnet.
- NEVER read, print, log, commit, or ask for secret keys, seed phrases or `.env` contents.
- Do NOT deploy, push, change git remotes, create GitHub issues, install tools, run `sudo`, or pipe downloads into a shell. Write scripts and stop; the human runs them.
- Do not add dependencies without saying why, and check the package (maintainer, recent releases) first.
- Never add a "Generated with Codebuff" trailer or any co-author trailer to commit messages.

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

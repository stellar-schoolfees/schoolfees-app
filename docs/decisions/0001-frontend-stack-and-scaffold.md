# 0001 — Frontend stack: Vite + React + TypeScript, not Scaffold Stellar

- **Status:** accepted
- **Date:** 2026-09-30
- **Deciders:** maintainer (solo builder)

## Context

`AGENTS.md` says the preferred way to start this repo is "the current Scaffold
Stellar init flow", and to fall back to Vite + React + TypeScript with the
Stellar SDK and Stellar Wallets Kit if that flow is not available as documented
or needs tools that would have to be installed first. Either way the decision
has to be recorded here.

## What was checked

On 2026-09-30, the Scaffold Stellar page on developers.stellar.org
(<https://developers.stellar.org/docs/tools/scaffold-stellar>) was read. It
documents the flow as:

1. install two global CLIs —
   `cargo install --locked stellar-scaffold-cli` and
   `cargo install --locked stellar-registry-cli` (or `cargo binstall ...`);
2. install **Docker**, "for running a local Stellar network via the
   `stellar/quickstart` image";
3. run `stellar scaffold init my-project`, which creates a full-stack project
   with its own `contracts/` directory, generated TypeScript contract clients
   under `packages/`, a React frontend, and an `environments.toml`.

So the flow is available as documented, but it needs tools installed globally
on this machine, and it scaffolds its own contracts workspace.

## Decision

Use **Vite + React + TypeScript** (the `create-vite` `react-ts` template),
with:

- **`@stellar/stellar-sdk` 17.2.0** — RPC client, `Contract`, transaction
  builder, `nativeToScVal`/`scValToNative`.
- **`@creit.tech/stellar-wallets-kit` 2.7.0** — the wallet connection and
  signing layer. Its own dependency range is `@stellar/stellar-sdk ^17.0.0`, so
  it matches the SDK version above with no override.
- **oxlint 1.86.0** for linting (what the current Vite template ships, in place
  of ESLint), **vitest 5.0.3** for unit tests, **TypeScript 6.0.3** with
  `strict: true`, and **Vite 8.3.1**, **React 19.3.0**.

Versions above were resolved by `npm install` from the npm registry on
2026-09-30 and read back from `node_modules`; the lockfile is committed, so CI
installs exactly these.

## Why not Scaffold Stellar

- It requires global CLI installs (and Docker) before it can do anything. This
  repository's rules say an agent must not install tools, and the maintainer
  would be installing a second, parallel contract toolchain for a project that
  already has a finished contract repo.
- It generates its own `contracts/` workspace and a contract registry. This
  project's contract already lives in `schoolfees-contracts`, is tested, and is
  deliberately **not** deployed yet (pilot gate). A generated contracts folder
  would duplicate or contradict it.
- Its registry/deployment tooling is aimed at publishing wasm to a registry,
  which is more than this pilot needs and is explicitly out of scope.

The fallback that `AGENTS.md` names is therefore the right fit, and it is what
this repo uses.

## Consequences

- No generated contract client. The app builds its own calls in
  `src/lib/contract.ts`. Method names and argument order are taken from
  `src/lib.rs` in `schoolfees-contracts`, and the conversions were verified
  against the installed SDK rather than assumed (see `src/lib/scval.test.ts`).
- The contract id is configuration, not generated code: it comes from `.env`
  through `src/config.ts`, and stays a placeholder until deployment.
- The wallet kit is a large dependency tree (Ledger, Trezor, WalletConnect,
  Reown and others), which makes the initial JavaScript bundle about 1 MB
  (263 kB gzipped). Splitting the kit out of the initial load is recorded as a
  draft in `docs/issue-drafts/`.
- Nothing about this choice prevents adopting Scaffold Stellar later for a
  different project; it is a per-repo decision.

## Re-evaluate when

- Scaffold Stellar can scaffold a frontend **against an existing, external
  contract repo** without a generated contracts workspace, or
- the maintainer starts a new Stellar project from scratch, where the generated
  contracts + clients are a benefit rather than a duplicate.

# schoolfees — app

A small web app for paying **school fees** on Stellar testnet. A school records
a fee obligation against an opaque reference, a payer settles it in any number
of installments, and anyone can read the record. The contract never holds money:
payments move straight from the payer's balance to the school's.

> **Status: v0 UI implemented (testnet only, never deployed, no pilot yet).**
> Nothing here has touched a real wallet or a real network. The contract id is a
> placeholder until a school or tutorial centre agrees to a pilot.

Part of the schoolfees project, which is three repositories:
[`schoolfees-contracts`](https://github.com/stellar-schoolfees/schoolfees-contracts)
(the Rust contract), `schoolfees-app` (this one) and
[`schoolfees-docs`](https://github.com/stellar-schoolfees/schoolfees-docs) (the book).

## What the app does

| Page | Who | What it does |
|---|---|---|
| Home / Connect | anyone | Explains the flow, connects a wallet, states what has not happened yet |
| Create a fee | school | Records a fee: token, opaque reference, total, due date |
| View a fee | anyone | Looks a fee up by id and shows everything stored, plus its status |
| Pay | payer | Pays part or all of a fee, straight to the school |
| School actions | school | Refunds a payer from the school's own balance; closes a settled fee |

Contract functions are called exactly as named in `src/lib.rs` in
`schoolfees-contracts`: `create_fee`, `pay`, `close_fee`, `refund`, `get_fee`,
`status`. No other contract function exists in v0.

## Rules the app enforces

- A visible **"TESTNET - no real money"** banner on every screen, including the
  configuration-error screen.
- The app **refuses to operate on any network other than testnet**: the network
  comes from `.env`, the passphrase is pinned in `src/lib/network.ts`, and the
  wallet's own network is re-read before every write.
- **Wallets sign; the app never asks for, receives, stores or logs a secret key
  or seed phrase.** It only ever sees a public address and a signed XDR.
- Every action that produces a transaction shows the **transaction hash and an
  explorer link**.
- **No analytics, no trackers, no third-party scripts, no backend.** The app
  itself sends nothing anywhere except to the Stellar RPC endpoint from `.env`.
  One measured caveat, added 2026-10-01: **opening the wallet picker loads
  wallet icons from third-party hosts** — `https://stellar.creit.tech/wallet-icons/…`
  for most entries, plus `https://scopuly.com` and `https://uni.onekey-asset.com`
  for two of them — because the wallet kit renders a remote icon per module. A
  page load makes no such request. See
  [docs/SECURITY.md](docs/SECURITY.md) for exactly what is fetched and when, and
  [draft 15](docs/issue-drafts/15-correct-the-outbound-request-claim.md) for the
  open decision to narrow the module set.
- The reference field accepts **only a 32-byte opaque value** (64 hex
  characters) and says in plain words that names, phone numbers, emails and
  student or member ids must never be entered.

## Getting started

Requires **Node.js 24** (what CI and the maintainer's machine use).

```bash
cp .env.example .env      # then fill in the values
npm install
npm run dev
```

`.env` is git-ignored and must never be committed. Every value the app reads is
documented in [.env.example](.env.example), and it is read in exactly one place,
[src/config.ts](src/config.ts).

## Checks

```bash
npm run lint        # oxlint
npm run typecheck   # tsc -b (strict)
npm test            # vitest, unit tests for src/lib
npm run build       # tsc -b && vite build
```

All four run in CI ([.github/workflows/web.yml](.github/workflows/web.yml)).

## Structure

```text
├── src/
│   ├── config.ts          # the only place .env is read
│   ├── lib/               # pure logic + unit tests
│   │   ├── network.ts     #   config resolution, testnet-only refusal
│   │   ├── amount.ts      #   amount parsing and formatting
│   │   ├── datetime.ts    #   Unix seconds <-> local input
│   │   ├── reference.ts   #   opaque reference validation + the warning
│   │   ├── validation.ts  #   address, contract id and fee id checks
│   │   ├── contractErrors.ts  # error code -> ERRORS.md wording
│   │   ├── fee.ts         #   Fee record helpers and status rules
│   │   ├── scval.ts       #   JS <-> xdr.ScVal conversions
│   │   ├── contract.ts    #   the Soroban client (build/simulate/submit)
│   │   ├── wallet.ts      #   Stellar Wallets Kit adapter
│   │   └── explorer.ts    #   explorer links
│   ├── hooks/             # useWallet, useAction
│   ├── components/        # UI only
│   └── pages/             # one per flow
├── docs/
│   ├── decisions/         # 0001: why Vite + React, not Scaffold Stellar
│   ├── issue-drafts/      # everything not built, as drafts
│   └── contract-errors.md # vendored copy of ERRORS.md, used by the tests
└── scripts/deploy-testnet.sh   # written, never run by an agent
```

## Errors

Error wording is **never written in this repo**. `src/lib/contractErrors.ts`
maps the contract's numeric error codes to the "user-facing message" column of
`ERRORS.md` in `schoolfees-contracts`, and
[src/lib/contractErrors.test.ts](src/lib/contractErrors.test.ts) fails if a
variant in the vendored copy of that table has no mapped message — in either
direction. If `ERRORS.md` changes, re-copy
[docs/contract-errors.md](docs/contract-errors.md) in the same commit.

## What is proven vs assumed

Read this before trusting the app with anything.

**Proven — actually executed, locally and in CI:**

- Unit tests for every pure function in `src/lib/`: 85 tests covering amount
  parsing and formatting, date conversion, opaque reference validation, address
  and fee id validation, fee status rules, `remaining`, explorer links, config
  resolution and the testnet refusal paths, and the full error mapping.
- ScVal conversion round-trips against the **real** SDK encoders, including a
  `Fee` struct with the same type hints as the contract's ABI (u64, i128,
  address, bytes, bool).
- `oxlint`, `tsc` in strict mode, and the production build all pass.

**Assumed — never exercised:**

- **No contract is deployed**, so the app has never called one. Every RPC call
  in `src/lib/contract.ts` is unproven.
- **No real wallet has connected**, signed, or been asked for its network.
- **No transaction has ever been submitted** from this app, so the submit/poll
  path, the archived-record refusal, and the "extract the code from a host error
  string" assumption (`Error(Contract, #N)`) are untested against a real network.
- The contract's `status()` return value is read defensively (symbol, single-element
  vec, or object) because unit-variant enums were not verified against a deployed
  contract; an unrecognised value shows as `Unknown` rather than a guess.
- **Accessibility is built in, not audited**: semantic landmarks, labels, focus
  styles and `aria-describedby` are used throughout, but no screen-reader or
  keyboard audit has been done.
- Only pure logic is unit tested. Components and pages have no render tests, and
  nothing runs in a browser in CI.

The first real evidence will come from a testnet pilot. Until then, treat the
chain-facing code as unverified.

## Contract deployment

Deploying and setting the contract id are the maintainer's steps, and both stay
blocked until a real school or tutorial centre has agreed to a pilot.
[scripts/deploy-testnet.sh](scripts/deploy-testnet.sh) refuses to run without
`PILOT_CONFIRMED=yes`. It was written, not run: no agent should run it.

## Decisions and roadmap

- [docs/decisions/0001](docs/decisions/0001-frontend-stack-and-scaffold.md) — why
  Vite + React + TypeScript instead of Scaffold Stellar, with the versions used.
- [ROADMAP.md](ROADMAP.md) — what is next, and what is deliberately not built.
- [docs/issue-drafts](docs/issue-drafts/README.md) — the same gaps as drafts.
- The engineering standards this repo is held to (Build Arsenal crypto profile +
  Flowtick), and the audits run against it on 2026-10-01:
  [SECURITY](docs/SECURITY.md), [TESTING](docs/TESTING.md),
  [DESIGN_GUIDELINES](docs/DESIGN_GUIDELINES.md),
  [ACCESSIBILITY](docs/ACCESSIBILITY.md),
  [DEPLOYMENT_CHECKLIST](docs/DEPLOYMENT_CHECKLIST.md),
  [PRODUCTION_QUALITY](docs/PRODUCTION_QUALITY.md),
  [RESOURCES](docs/RESOURCES.md). The across-repo gap map and audit reports live
  in `schoolfees-docs/docs/`.

## Notes

- The wallet kit is a large dependency tree: the initial bundle is about 1 MB
  (263 kB gzipped). Splitting it out is [draft 02](docs/issue-drafts/02-code-split-wallet-kit.md).
- Amounts are whole numbers in the token's smallest unit; the app does not
  convert decimal places yet ([draft 03](docs/issue-drafts/03-token-decimals-and-metadata.md)).

## License

MIT — see [LICENSE](LICENSE).

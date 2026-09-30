# Roadmap

What is next for the app, in order. Anything not listed as done is **not
implemented**.

## Done (v0 UI)

- [x] Vite + React + TypeScript scaffold, strict mode, with the stack decision recorded in [docs/decisions/0001](docs/decisions/0001-frontend-stack-and-scaffold.md).
- [x] Network and contract id read from `.env` only, via `src/config.ts`; the app refuses any network that is not testnet.
- [x] `src/lib/` pure functions with unit tests: amount and date handling, opaque reference validation, address and fee id validation, fee status rules, ScVal conversion, and contract error mapping.
- [x] Error mapping taken from the "user-facing message" column of `ERRORS.md`, with a test that fails if a documented variant has no mapped message (in either direction).
- [x] Pages for the five flows: connect, create fee, view fee, pay, refund/close.
- [x] Rules enforced in code: TESTNET banner, testnet-only refusal, no secret keys, transaction hash and explorer link after every action, mobile-first and accessible markup, no analytics or backend.
- [x] `.github/workflows/web.yml` runs lint, type-check, unit tests and the production build.
- [x] `scripts/deploy-testnet.sh` written (and never run by an agent), gated on `PILOT_CONFIRMED=yes`.

## Next

- [x] Push v0 and get CI green on GitHub.
- [ ] **Blocked on the pilot gate:** the first testnet deployment, run by the maintainer, once a real school or tutorial centre has agreed to try the flow. Then set `VITE_CONTRACT_ID` and record the real id and explorer links in the docs repo. This is a maintainer step, so it deliberately has no issue draft.
- [ ] The first run against a deployed contract: create, read, pay, refund and close one real fee, and fix whatever that reveals. Until this happens every chain-facing line of the app is unproven (see the README) — the repeatable version of this is [draft 04](docs/issue-drafts/04-end-to-end-tests-against-testnet.md).

## Later (contributor-sized, not v0)

Each has a draft in [docs/issue-drafts](docs/issue-drafts):

- [ ] Generate the opaque reference in the app by hashing an internal id — [draft](docs/issue-drafts/01-in-app-reference-generator.md).
- [ ] Code-split the wallet kit out of the initial bundle — [draft](docs/issue-drafts/02-code-split-wallet-kit.md).
- [ ] Show amounts in human units from the token's decimals — [draft](docs/issue-drafts/03-token-decimals-and-metadata.md).
- [ ] End-to-end tests against testnet — [draft](docs/issue-drafts/04-end-to-end-tests-against-testnet.md).
- [ ] A printable receipt for a payer — [draft](docs/issue-drafts/05-receipt-export.md).
- [ ] List a school's fees from `FeeCreated` events — [draft](docs/issue-drafts/06-list-school-fees.md).
- [ ] Component and page render tests, and a screen-reader audit — [draft](docs/issue-drafts/07-component-and-accessibility-tests.md).
- [ ] Restore an archived fee record (the contract has no restore entrypoint in v0 either) — [draft](docs/issue-drafts/08-restore-archived-fee-record.md).
- [ ] Translate the interface — [draft](docs/issue-drafts/09-translate-the-interface.md).

## Explicitly out of scope

Mainnet, any backend or database, analytics or trackers, a TypeScript SDK, and
any feature the contract does not have.

Reminders or notifications are also out of scope: they need a backend and a
contact channel this project deliberately does not have, and the app stores no
contact details (and must not).

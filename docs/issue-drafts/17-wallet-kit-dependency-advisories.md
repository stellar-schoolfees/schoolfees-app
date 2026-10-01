# Decide what to do about the wallet kit's dependency advisories

**Difficulty:** medium
**Labels:** help wanted, area:app

## Problem

`npm audit` was run for the first time on 2026-10-01 and reports:

```
19 vulnerabilities (13 low, 6 moderate)
```

Every one arrives through `@creit.tech/stellar-wallets-kit@2.7.0`, whose
dependency tree pulls multi-chain wallet SDKs this app never uses:

- `@hot-wallet/sdk@1.0.11` → `@near-js/*` → `secp256k1` → **`elliptic`**
  (GHSA-848j-6mx2-7j84);
- `@solana/web3.js@1.99.0` → **`jayson`** → **`stream-json`**
  (GHSA-528h-pc64-c93x);
- **`uuid@8.3.2`** (GHSA-w5hq-g745-h8pq).

Two things make this more than a version bump:

1. **The only offered fix is a downgrade.** `npm audit fix --force` would install
   `@creit.tech/stellar-wallets-kit@1.5.0` — a breaking change to the one
   dependency that makes the app work at all. It was **not** applied.
2. **One package declares no licence.** `@hot-wallet/sdk@1.0.11` has an empty
   `license` field in its `package.json`. For a project that publishes under MIT,
   shipping a dependency with no stated licence is a small but real uncertainty.

Also relevant: the flagged code is multi-chain (NEAR and Solana) and a
Stellar-only app most likely never executes it, but it **is** bundled — the
initial chunk is ~1 MB, most of it this tree. "Probably not reachable" is a
judgement, not a proof, and it belongs in writing.

This is a **security decision**, so it is recorded as one: see "Decisions needed
from Tim" in `schoolfees-docs/docs/arsenal-gap-map.md` §9.

## Scope

Investigate, then choose **one** and document the reasoning:

- **A — accept and document.** Record each advisory, why the code path is not
  reached by this app, and the residual risk.
- **B — pin/override a patched transitive version** where that is possible without
  breaking the kit, and record what changed.
- **C — narrow the kit's module set** to Stellar-only wallets, which drops the
  multi-chain tree (and much of the bundle). This is the same change draft 02
  wants, and it is the option that removes the problem rather than documenting it.

Out of scope: `npm audit fix --force` without review; adding a dependency to
patch around the kit; changing the wallet UX or which wallets a user can pick
without saying so; and any change to the contract.

## Acceptance criteria

- [ ] Each advisory is recorded in `docs/RESOURCES.md` §3 with its package, the advisory link, and whether this app can reach the vulnerable code.
- [ ] A decision (A, B or C) is stated with its reasoning, and the alternative it rejected.
- [ ] The missing licence on `@hot-wallet/sdk` is resolved or explicitly recorded as accepted with the reasoning.
- [ ] `docs/SECURITY.md` §7 says what was actually done, not what is planned.
- [ ] Whichever option is chosen, `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass, and the app still connects a wallet (recorded honestly, including the fact that no real wallet has signed yet).
- [ ] If the module set is narrowed, `docs/DEPLOYMENT_CHECKLIST.md` §4 (the wallet/connect step) and `docs/PRODUCTION_QUALITY.md` §4 (bundle size) are updated.

## Where to start

`docs/RESOURCES.md` §2–§3, `docs/SECURITY.md` §7, `package.json`, and
`src/lib/wallet.ts` (the `defaultModules()` call is the chokepoint). The audit
`schoolfees-docs/docs/audits/2026-10-01-06-security-review.md` has the raw
evidence.

## How to test

```bash
npm audit
npm ls @hot-wallet/sdk @solana/web3.js elliptic uuid
npm run lint && npm run typecheck && npm test && npm run build
```

Then confirm the connect flow still opens the wallet picker.

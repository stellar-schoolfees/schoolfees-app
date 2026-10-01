# Resources — dependency and licence register

One row per real dependency, read from the **installed** packages on 2026-10-01
(`node_modules/*/package.json`), not from a guess or from the manifest range. If
a licence could not be determined it says so instead of assuming MIT.

Adapted from the Build Arsenal `RESOURCES_TEMPLATE`: name, version, purpose,
licence, and whether it ships to production.

## 1. Direct dependencies (`package.json`)

| Package | Declared | Installed | Purpose | Licence | Ships to production |
|---|---|---|---|---|---|
| `@creit.tech/stellar-wallets-kit` | `^2.7.0` | 2.7.0 | wallet connection, address retrieval, signing | MIT | **yes** — bundled (~1 MB of the initial chunk) |
| `@stellar/stellar-sdk` | `^17.2.0` | 17.2.0 | RPC client, `StrKey` validation, transaction building, XDR/ScVal encoding | Apache-2.0 | **yes** |
| `react` | `^19.2.8` | 19.3.0 | UI | MIT | **yes** |
| `react-dom` | `^19.2.8` | 19.3.0 | UI rendering | MIT | **yes** |
| `@types/node` | `^24.13.3` | 24.19.0 | types for the Node APIs used in tests | MIT | no (dev) |
| `@types/react` | `^19.2.18` | 19.3.0 | React types | MIT | no (dev) |
| `@types/react-dom` | `^19.2.7` | 19.3.0 | React DOM types | MIT | no (dev) |
| `@vitejs/plugin-react` | `^6.1.1` | 6.1.1 | JSX and Fast Refresh for Vite | MIT | no (dev) |
| `oxlint` | `^1.81.0` | 1.86.0 | lint | MIT | no (dev) |
| `typescript` | `~6.0.2` | 6.0.3 | type-checking and the build's `tsc -b` step | Apache-2.0 | no (dev) |
| `vite` | `^8.3.0` | 8.3.1 | dev server and production bundler | MIT | no (dev) — its output is, its code is not |
| `vitest` | `^5.0.3` | 5.0.3 | unit test runner | MIT | no (dev) |

Every declared licence was read from the installed package. All twelve are
permissive (MIT or Apache-2.0); **none is copyleft**, so nothing here imposes a
distribution obligation on the app's MIT licence.

## 2. Transitive dependencies that matter

The wallet kit pulls a whole multi-chain wallet stack. These are the ones worth
knowing about, with the version actually installed and its declared licence.

| Package | Installed | Why it is there | Licence | Note |
|---|---|---|---|---|
| `@hot-wallet/sdk` | 1.0.11 | a wallet module the kit bundles | **none declared** | The package's `package.json` has an **empty `license` field**. Shipping a dependency with no stated licence is a real (if small) legal uncertainty. Reported in audit `06` |
| `near-api-js` | 5.1.1 | the NEAR wallet modules | `(MIT AND Apache-2.0)` | multi-chain code unused by a Stellar-only app |
| `@solana/web3.js` | 1.99.0 | the Solana wallet modules | MIT | same |
| `@near-js/crypto` | 1.4.2 | NEAR crypto | ISC | pulls `secp256k1` → `elliptic` |
| `secp256k1` | 5.0.1 | NEAR crypto | MIT | |
| `elliptic` | 6.6.1 | crypto primitive | MIT | flagged by `npm audit` (GHSA-848j-6mx2-7j84) |
| `jayson` | 4.3.0 | Solana JSON-RPC | MIT | flagged (via `stream-json`) |
| `stream-json` | 1.9.1 | Solana JSON-RPC | BSD-3-Clause | flagged (GHSA-528h-pc64-c93x) |
| `uuid` | 8.3.2 | Solana | MIT | flagged (GHSA-w5hq-g745-h8pq) |

Also present in the kit's declared dependency list and **not** observed in the
built bundle: `@walletconnect/sign-client`, `@walletconnect/types`,
`@reown/appkit` (grepped the built assets for `walletconnect` and `reown`: zero
matches). They still count as part of the audited dependency tree.

## 3. Vulnerability review

`npm audit` was run for the first time on 2026-10-01:

```
19 vulnerabilities (13 low, 6 moderate)
```

- **All 19 are transitive**, reached through
  `@creit.tech/stellar-wallets-kit@2.7.0`. None is in the app's own code or in
  the four direct runtime dependencies.
- The only fix `npm audit` offers is `npm audit fix --force`, which **downgrades
  the wallet kit to 1.5.0** — a breaking change. It was **not** applied. Nothing
  was installed, upgraded or downgraded.
- Advisory links, for the record: GHSA-848j-6mx2-7j84 (`elliptic`),
  GHSA-528h-pc64-c93x (`stream-json`), GHSA-w5hq-g745-h8pq (`uuid`).
- **`cargo audit` is not installed** (contract repo), so the Rust dependency
  tree has had no vulnerability scan. Stated rather than glossed over.
- No SBOM, no licence-compliance scan and no dynamic analysis has been run.

The decision that follows from this — accept the risk, wait for an upstream
release, or narrow the wallet module set — is a security decision and is
recorded in `schoolfees-docs/docs/arsenal-gap-map.md` §9 ("Decisions needed from
Tim"). It is tracked by [draft 17](issue-drafts/17-wallet-kit-dependency-advisories.md);
the related bundle-size work is [draft 02](issue-drafts/02-code-split-wallet-kit.md),
and the exploitability question itself is written up in
`schoolfees-docs/docs/audits/2026-10-01-06-security-review.md`.

## 4. Development-only resources (not dependencies)

| Resource | Purpose | Licence / cost | Notes |
|---|---|---|---|
| Node.js 24 | runtime for the dev server, build and tests | MIT (Node itself) | matches CI |
| npm | package manager | Artistic-2.0 | matched to `package-lock.json`; no other manager is used |
| mdBook | docs repo only | MPL-2.0 | deliberately **not installed** on this machine; the build is CI-only |
| Stellar testnet RPC | the endpoint the app talks to | free public service | configured from `.env`; no API key |
| `stellar.expert` explorer (testnet) | transaction and contract links | third-party website | linked to, never embedded |
| Build Arsenal and Flowtick references | engineering standards | read-only, outside every repo | not distributed with the project and not depended on at runtime |

## 5. Asset licences

- **No fonts** are shipped — the app uses the system font stack, so there is no
  font licence to track.
- **No images, icons or illustrations** are shipped — the app has no assets
  directory and no `<img>`. The only images a user sees come from the wallet
  kit's remote icon URLs (see [`SECURITY.md`](SECURITY.md) §8).
- **No third-party CSS** or theme. `src/index.css` is written for this project.

## 6. Rules for adding a dependency

1. Say why, in the pull request, and check the maintainer and recent releases
   first (`AGENTS.md`).
2. Prefer the standard library and the two SDKs already present.
3. Record it here — name, version, purpose, licence, and whether it ships to
   production — in the same commit that adds it.
4. If the licence cannot be determined from the installed package, treat that as
   a blocker and say so, rather than assuming.
5. Never add a dependency for a visual effect, and never add analytics, trackers
   or third-party scripts: both are forbidden by `AGENTS.md`.

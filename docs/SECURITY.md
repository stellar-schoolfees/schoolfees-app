# Security — schoolfees app

What this app's security depends on, what it does, and what it does **not** do.
Adapted from the Build Arsenal security templates and `CRYPTO_SECURITY` to a
Vite + React + TypeScript testnet app with no backend.

The threat walk-through is **not** duplicated here: the single source of truth
is
[`schoolfees-docs/src/threat-model.md`](https://github.com/stellar-schoolfees/schoolfees-docs/blob/main/src/threat-model.md),
and the contract's own requirements are in
[`schoolfees-contracts/docs/SECURITY.md`](https://github.com/stellar-schoolfees/schoolfees-contracts/blob/main/docs/SECURITY.md).
This page is the app's requirements list; it is the checklist used by
`schoolfees-docs/docs/audits/2026-10-01-06-security-review.md`.

Status: **testnet only, never deployed, never run against a real wallet.** The
app is a static bundle. There is no server, no session, no database and no
secret to protect on the client — which changes what "security" means here:
the risks are a wrong network, a wrong address, a duplicated submission, and a
third-party dependency tree, not an attack on our infrastructure.

## 1. Wallet rules (non-negotiable)

- **The app never asks for, receives, stores or logs a secret key or seed
  phrase.** It only ever sees a public address and a signed XDR. There is no
  code path that could do otherwise: `src/lib/wallet.ts` calls exactly
  `authModal()`, `getAddress()`, `signTransaction()`, `getNetwork()` and
  `disconnect()` on the kit.
- **The app generates no keys.** It has no keypair, no mnemonic, no recovery
  phrase, no "create wallet" flow.
- **Signing is always explicit and user-driven.** The app builds and simulates a
  transaction, then hands the unsigned XDR to the wallet, which prompts.
- **No privileged secret is ever in the client.** There is nothing to put there:
  the contract id and RPC URL are public values from `.env`, read in exactly one
  module (`src/config.ts`).

## 2. Network safety

| Requirement | Where |
|---|---|
| The app operates on testnet only, and there is a constant for it | `src/lib/network.ts` (`SUPPORTED_NETWORK`, `TESTNET_PASSPHRASE` from the SDK, not typed out) |
| A value other than `testnet` in `.env` makes the app refuse to render any page | `resolveNetworkConfig` returns `ok: false`; `App.tsx` renders only the banner and `ConfigNotice` |
| The network passphrase is pinned in code, so renaming the network cannot fool it | `isTestnetPassphrase` compares against `Networks.TESTNET` |
| **The wallet's own network is re-read before every write** and anything that is not testnet aborts before a transaction is even built | `src/lib/flow.ts::runWrite` → `checkWalletNetwork()` → `WrongNetworkError` |
| The network is **visible before signing**: a badge in the header and an explicit warning when it is not testnet | `src/components/WalletBar.tsx` |
| A wallet that cannot report its network is treated as **not** on testnet | `src/hooks/useWallet.ts::refreshNetwork` (the catch sets `onTestnet` to `false`) |
| The testnet status is stated on every screen, including the error screens | `src/components/TestnetBanner.tsx`, rendered by `App.tsx` before any page |

This is the strongest part of the app: the refusals are unit tested in
`src/lib/network.test.ts` (including the real-network passphrase, which is not
trusted on its own).

## 3. Input validation

Everything a user types is validated by a pure function in `src/lib/` before it
reaches a transaction, and each of those functions has unit tests.

| Input | Rule | Module |
|---|---|---|
| Contract ids (token, and the app's own) | `StrKey.isValidContract` — a `C…` address, so the `.env` placeholder is rejected rather than sent | `src/lib/validation.ts`, `src/lib/network.ts` |
| Account addresses (payer) | `StrKey.isValidEd25519PublicKey` — a `G…` address | `src/lib/validation.ts` |
| Fee id | digits only, ≥ 1 (fee ids start at 1 on-chain) | `src/lib/validation.ts` |
| Amounts | whole positive integers, parsed as `bigint` (never `number`) | `src/lib/amount.ts`, `src/lib/scval.ts` |
| **The opaque reference** | exactly 64 hexadecimal characters = 32 bytes; anything else — including anything that looks like a free-text identifier — is refused, with the plain-words warning shown next to the field | `src/lib/reference.ts` |
| Due date | a real date in the future, in whole Unix seconds | `src/lib/datetime.ts` |

- React escapes every rendered value. There is **no `dangerouslySetInnerHTML`**,
  no `innerHTML`, and no user text is ever interpreted as markup.
- The app renders the contract's own data (amounts, addresses, references) as
  text; a hostile value can only ever be shown, not executed.
- **The reference's contents cannot be validated** — the contract stores opaque
  bytes. The app enforces the format and states the rule; it cannot detect that
  a 64-hex string is a hash of a name.

## 4. Rejected and cancelled signatures

- A rejected or cancelled wallet prompt makes `signTransaction` throw; the throw
  propagates through `runWrite` into `useAction`, which maps it and shows it.
  There is no silent failure and no retry loop.
- The wording shown is the wallet's or the RPC's own message, passed through
  `describeContractError` unchanged when it is not a contract error. It is not
  reworded, and it is not disguised as one of the codes in `ERRORS.md`.
- `useWallet` surfaces a connection failure the same way, and a wallet that
  returns an empty address is treated as a failure.
- **Unverified:** no real wallet has ever been connected to this app, so this
  path has never actually run. See the README, "What is proven vs assumed".

## 5. RPC calls: failure handling, timeouts, retries

| Requirement | Status |
|---|---|
| Every failure is surfaced to the user instead of being swallowed | **exists** — `src/lib/contract.ts` throws `ContractCallError` for a simulation error, an archived record, a rejected transaction, an unconfirmed poll, or a missing read result |
| A recorded-but-archived entry is explained rather than failing cryptically | **exists** — `ARCHIVED_MESSAGE`, and the app says plainly that it cannot restore one |
| Transaction timeout is bounded | **partial** — `TransactionBuilder.setTimeout(60)` bounds the transaction's own validity window |
| Bounded retries, with backoff, for `getAccount` / `simulateTransaction` / `sendTransaction` / `pollTransaction` | **missing** — there is no retry logic at all: one failure is one failure. A flaky RPC is reported to the user as an error. Tracked as [draft 11](issue-drafts/11-bound-rpc-retries-and-timeouts.md) |
| Explicit request timeout on RPC and account lookups | **missing** — the SDK's defaults apply; nothing in this app sets them. Same draft |
| Unclear outcomes are never retried silently | **exists and is deliberate** — when a transaction is sent but not confirmed, the app says "check it before retrying" **with the hash**, rather than resending |
| An unconfirmed or failed transaction is never reported as successful | **exists** — only `SUCCESS` returns a hash-plus-result; `FAILED` and an unconfirmed poll both throw |

## 6. Duplicate submission and abandoned requests

`useAction.run` uses a synchronous in-flight ref: a second call cannot start
while the first promise remains pending, including after reset. Reset and
unmount invalidate the request generation; late results return `undefined`
instead of updating a summary or triggering a follow-up read. New actions clear
previous success. Tests cover same-turn duplicates, reset success/failure,
unmount and retry.

This is a per-hook guard, not cross-tab or on-chain idempotency. A second tab
can still pay twice. Unknown transaction outcomes are never automatically resent.

Wallet restore, connect and network checks are invalidated by disconnect or
unmount; duplicate connect requests are dropped. Older network responses cannot
override a newer failure. The UI disconnects immediately even if the adapter's
disconnect fails; the in-flight connection guard remains held until it settles.

## 7. Dependency review

- `package-lock.json` is committed and CI installs with `npm ci`, so the
  installed tree is the locked one.
- Adding a dependency needs a stated reason and a look at the maintainer and
  recent releases (`AGENTS.md`). The register is
  [`RESOURCES.md`](RESOURCES.md).
- **`npm audit --json` was rerun on 2026-10-07.** Result: **19 advisories — 13 low, 6 moderate.** Every one arrives
  through `@creit.tech/stellar-wallets-kit@2.7.0`, whose dependency tree pulls
  multi-chain wallet SDKs: `@hot-wallet/sdk` → `@near-js/*` → `secp256k1` →
  `elliptic` (GHSA-848j-6mx2-7j84), plus `@solana/web3.js` → `jayson` →
  `stream-json` (GHSA-528h-pc64-c93x) and `uuid` (GHSA-w5hq-g745-h8pq, v8.3.2).
  The only suggested fix is `npm audit fix --force`, which **downgrades the
  wallet kit to 1.5.0** — a breaking change that was not made. Nothing was
  installed or upgraded.
- **One transitive package declares no license**: `@hot-wallet/sdk@1.0.11` has
  an empty `license` field. See `RESOURCES.md`.
- **Not run:** `cargo audit` is not installed (contract repo), and no SBOM,
  licence-compliance scan or dynamic analysis has been done.

## 8. Client-side storage and privacy

Verified by reading the source, not assumed:

- **The app itself writes no storage at all.** `grep` for `localStorage`,
  `sessionStorage`, `document.cookie`, `fetch(` and `XMLHttpRequest` across
  `src/` and `index.html` returns **nothing**. The only network calls are the
  Stellar SDK's RPC calls to the URL from `.env`.
- **The wallet kit writes its own `localStorage` keys**: 
  `@StellarWalletsKit/activeAddress`, `selectedModuleId`, `usedWalletsIds`,
  `hardwareWalletPaths`, `wcSessionPaths`. They hold an address, a wallet
  selection and a hardware-path map — no key material, and nothing about a
  student or a payment. Written by the kit, never read by this app.
- **No analytics, trackers, third-party scripts, cookies or backend.** No
  `console.*` call exists in `src/`, so nothing about a payer is logged either.
- **One correction to a claim in the README**, found by auditing the production
  bundle: the built app **used to** fetch remote wallet icons from
  `https://stellar.creit.tech/wallet-icons/…` (plus `https://scopuly.com` and
  `https://uni.onekey-asset.com` for two entries) when the wallet picker was
  opened, because the kit rendered an icon per module. That is fixed as of
  2026-10-01: the picker is narrowed to Stellar wallets only and serves local
  icon files from `public/wallet-icons/`. Local icons remove those image requests. The selected wallet provider can
  make its own requests; no browser network capture has been run. The 2026-10-07
  built-asset string search found no WalletConnect/Reown identifiers
  (grepped: zero matches). Reported in
  `schoolfees-docs/docs/audits/2026-10-01-06-security-review.md`.
- The full storage and privacy inventory is written for a non-developer reader in
  [`schoolfees-docs/src/legal-compliance.md`](https://github.com/stellar-schoolfees/schoolfees-docs/blob/main/src/legal-compliance.md).

## 9. Out of scope, and honest limits

- **No independent review.** Nobody outside this project has reviewed the app
  for phishing, misleading display or error handling.
- **No CSP or security headers**, because there is no hosting configuration yet;
  the host is a human decision (`DEPLOYMENT_CHECKLIST.md`). When one exists, a
  `Content-Security-Policy` restricting `connect-src` to the RPC URL and
  `img-src` to `self` for local wallet icons would be the natural hardening step.
- There is no authenticated server session for CSRF. React escaping and
  absence of raw HTML reduce XSS exposure; compromised dependencies or hosting
  remain risks and have not been independently audited.
- **No protection against the most likely real attack**: a user being persuaded
  to pay a fee that is not theirs, or to the wrong address. The app shows what
  the contract stores, which is the best it can do; verification is out of band.
- **Wallet and browser compromise** are outside this app's control.
- **The installed wallet kit retains a multi-chain dependency tree.** The app
  imports only eight Stellar module entry points lazily; excluded modules remain
  installed but are not intentionally imported. This reduces runtime exposure,
  not the audit count or every possible dependency risk. See
  [RESOURCES.md](RESOURCES.md) for the current review.
- **Simulated reads do not keep records alive.** The app's read screens call
  `simulateTransaction`, so the contract's TTL extension during a read is
  discarded; only submitted transactions persist an extension. The "every
  read and write re-extends" property holds on-chain but not for app
  browsing, so a fee nobody writes to can archive while people look at it.
  Decided 2026-10-02 as option A in
  [draft 18](issue-drafts/18-reads-do-not-keep-records-alive.md).

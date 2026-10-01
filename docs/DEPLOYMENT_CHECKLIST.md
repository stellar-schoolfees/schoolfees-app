# Deployment checklist — schoolfees app

The release gate for the app. Adapted from the Build Arsenal
`RELEASE_RUNBOOK`, `PRELAUNCH_CHECKLIST` and `DEPLOYMENT_CHECKLIST_TEMPLATE` to a
static Vite bundle that talks to testnet.

**Testnet only.** Nothing on this page has been done: the app has never been
deployed, and it has never run against a deployed contract or a real wallet.
Publishing the bundle is **Tim's step** (see §7) — an agent writes scripts and
stops.

## 1. Gate: do not deploy before this

- [ ] A real school or tutorial centre has agreed to try the flow, and the
      maintainer has deployed the contract
      (`schoolfees-contracts/docs/DEPLOYMENT_CHECKLIST.md` §1).
- [ ] A real testnet contract id exists. Until then, `.env` keeps the
      placeholder and the app shows its configuration notice. **Never put a
      placeholder, a guessed or an unverified contract id in a deployed build.**
- [ ] The pilot's readiness checklist
      (`schoolfees-docs/src/pilot-readiness.md`) is ticked.

## 2. Build and checks

- [ ] Working tree clean, on `main`, CI green (`.github/workflows/web.yml`).
- [ ] `npm ci` from the committed lockfile — never a fresh resolve for a release.
- [ ] `npm run lint` — 0 errors, 0 warnings.
- [ ] `npm run typecheck` — clean.
- [ ] `npm test` — 24 files, 154 tests passing locally (153 in CI; the cross-repo
      `ERRORS.md` comparison skips there).
- [ ] `npm run build` — succeeds. **The ~1 MB initial chunk warning is known and
      accepted** ([draft 02](issue-drafts/02-code-split-wallet-kit.md)); do not
      let a new warning appear unnoticed.
- [ ] `docs/contract-errors.md` re-copied from the contract's `ERRORS.md` in the
      same commit as any error-table change.
- [ ] Source maps: the default Vite build ships **none**. Shipping them would be
      a deliberate decision (it exposes the source); if it is ever turned on,
      say so in the release notes.

## 3. Environment

- [ ] `VITE_STELLAR_NETWORK=testnet` — anything else makes the app refuse to run.
- [ ] `VITE_SOROBAN_RPC_URL` points at the testnet RPC endpoint actually
      intended, and it is https.
- [ ] `VITE_CONTRACT_ID` is the **real deployed testnet contract id** (`C…`),
      verified against the explorer. A placeholder fails validation and the app
      renders only the configuration notice — which is the correct behaviour,
      not a bug to work around.
- [ ] `VITE_EXPLORER_BASE_URL` is the testnet explorer base.
- [ ] No secret, key or seed phrase exists in any environment variable — there
      is nothing in this app that needs one. `.env` is git-ignored and never
      committed; the hosting provider's env settings hold the same four public
      values.

## 4. Behaviour to confirm on the deployed build

- [ ] The **TESTNET banner** is the most prominent element on every screen,
      including the configuration-error screen, and it is visible without
      scrolling on a phone.
- [ ] The app **refuses other networks**: with the wallet set to anything but
      testnet, no transaction is built and the refusal is explicit.
- [ ] **Error handling**: a contract error shows the reviewed `ERRORS.md`
      wording plus its next action; a non-contract failure is passed through
      rather than disguised.
- [ ] **Loading states**: every action button shows `Loading…`/`Connecting…` and
      is disabled while busy.
- [ ] **Empty states**: a page that needs a wallet shows the connect prompt
      rather than a dead form; a fee that does not exist shows the
      `FeeNotFound` wording, not a blank area. (There are no list views, so
      there is no "no results" state — see
      [`TESTING.md`](TESTING.md) §3.)
- [ ] **Duplicate submission**: double-clicking a submit button produces exactly
      one transaction on-chain. Currently only partly guarded — confirm it by
      hand, and see [draft 13](issue-drafts/13-guard-against-duplicate-submission.md).
- [ ] **Failure after sending**: an unconfirmed transaction is reported with its
      hash and never as a success.
- [ ] **Console is clean** on every page: no errors, no warnings, and no failed
      requests other than the intended RPC calls. (Opening the wallet picker
      fetches remote wallet icons — expected, see
      [`SECURITY.md`](SECURITY.md) §8.)
- [ ] **No analytics, trackers or third-party scripts** were added by the host.
- [ ] Mobile at **390×844**: no horizontal scrolling, banner visible, actions
      reachable.
- [ ] Keyboard pass: visible focus on everything, skip link works.

## 5. Metadata and hosting configuration

- [ ] `index.html` title and meta description still describe the deployed state
      (they currently say testnet, which stays true).
- [ ] `theme-color` matches the banner background.
- [ ] A **favicon** exists — currently missing
      ([draft 16](issue-drafts/16-favicon-and-social-metadata.md)).
- [ ] Static hosting chosen and configured by Tim; the build output directory is
      `dist`.
- [ ] Client-side routing rewrites are **not needed today** (the app has no
      routes). **They become required the moment routing is added** — see
      [draft 12](issue-drafts/12-url-routing-and-deep-links.md) and Flowtick §4's
      host-side note.
- [ ] HTTPS is on (the host's default, but confirm).
- [ ] Canonical URL, `sitemap.xml`, `robots.txt` and social cards: **deferred
      until a real domain exists.** Never invent one. See
      [`PRODUCTION_QUALITY.md`](PRODUCTION_QUALITY.md).

## 6. After the deployment

- [ ] Run the full smoke test in [`TESTING.md`](TESTING.md) §4 against the live
      URL, not against localhost.
- [ ] Record the deployed URL and the commit it was built from: `TODO(verify)`.
- [ ] Record the real contract id and explorer links in the docs repo, and
      update the app `README.md` status banner from "never deployed".
- [ ] Check the live URL on a real phone, over a real mobile connection.
- [ ] Rollback plan: the host's previous-deployment revert, or redeploy the
      previous commit. The contract side has **no rollback** — see the contract
      checklist §6. A bad app deploy cannot damage the contract; a bad
      *transaction* cannot be undone.

## 7. What is left to Tim

- [ ] Choose the host and create the project (Vercel, Netlify, Cloudflare Pages,
      GitHub Pages or similar — the choice has not been made and is not made
      here).
- [ ] Connect it to `stellar-schoolfees/schoolfees-app`, build command
      `npm run build`, output directory `dist`, Node 24.
- [ ] Set the four public environment variables in the host's settings.
- [ ] Decide whether the deployed site is public or unlisted for the pilot, and
      whether its URL is shared with pilot participants.
- [ ] Decide whether a custom domain is wanted. If it is, register it and set a
      canonical URL — **no domain is assumed or invented anywhere in this
      repo**.

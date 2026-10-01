# Correct the claim that the app makes no request other than to the RPC endpoint

**Difficulty:** easy
**Labels:** good first issue, area:app

## Problem

The README states, in "Rules the app enforces":

> **No analytics, no trackers, no third-party scripts, no backend.** The built
> page makes no network request other than to the Stellar RPC endpoint from
> `.env`.

That is **not accurate**. Verified on 2026-10-01 by reading the production bundle:

- the wallet kit stores a **remote icon URL per wallet module**, e.g.
  `https://stellar.creit.tech/wallet-icons/freighter.png`, `…/albedo.png`,
  `…/lobstr.png`, plus `https://scopuly.com/img/logo/icon.png` and
  `https://uni.onekey-asset.com/static/logo/onekey.png`;
- when a user **opens the wallet picker**, those images are fetched from those
  third-party hosts.

So the claim is true of a page load (the app itself requests nothing but the RPC
endpoint) and **false the moment the connect flow is used**. For a project whose
whole argument is "we tell you exactly what leaves your browser", the wrong
version of this claim is worse than a smaller, accurate one. It also has a
privacy dimension: the icon host learns that someone opened the app, from their
IP. See `schoolfees-docs/src/legal-compliance.md` §2.

A second, related fact worth recording: the built bundle contains **no**
WalletConnect/Reown code (grepped: zero matches), despite those packages being in
the kit's dependency tree, so no relay connection is made — but that is a
property of the current build, not a guarantee.

## Scope

Two independent pieces of work, in order:

1. **Fix the wording.** No repository may claim there is no third-party request.
   State exactly which hosts are contacted, when, and what they receive.
2. **Decide what to do about it**, which is a security/privacy decision and must
   not be taken silently by an agent:
   - accept the icon hosts and document them (including the CSP they require), or
   - configure the kit with a narrower, Stellar-only module set using local icons,
     which removes the requests entirely — and also shrinks the ~1 MB bundle
     (draft 02).

Out of scope: choosing the module set unilaterally, adding an icon dependency,
and any analytics-related work (analytics remains forbidden).

## Acceptance criteria

- [ ] No file in any of the three repositories claims that no third-party request
      is made; `README.md`, `AGENTS.md` and the docs repo's
      `src/legal-compliance.md` agree with each other.
- [ ] The hosts, the trigger (opening the wallet picker) and the fact that an IP is
      exposed are documented in `docs/SECURITY.md` §8.
- [ ] A repeatable check exists — even a documented grep of the built bundle plus a
      "watch the network tab while opening the picker" step in
      `docs/TESTING.md` §4 — so the claim cannot silently drift again.
- [ ] If the module set is narrowed, `docs/RESOURCES.md` and the bundle-size note in
      `docs/PRODUCTION_QUALITY.md` are updated.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass.

## Where to start

`README.md` ("Rules the app enforces"), `src/lib/wallet.ts` (`defaultModules()` is
what pulls in the whole set), `docs/SECURITY.md` §8, and the audit
`schoolfees-docs/docs/audits/2026-10-01-06-security-review.md`.

## How to test

```bash
npm run build
grep -ohE 'https?://[a-z0-9.-]+' dist/assets/*.js | sort -u
```

Then `npm run preview`, open the wallet picker with the browser's network tab
open, and record which hosts appear.

# Give every view a URL, and deep links that work on reload

**Difficulty:** medium
**Labels:** help wanted, area:app

## Problem

Navigation is five `useState` tabs in `src/App.tsx` (`connect`, `create`,
`lookup`, `pay`, `school`). There is **no URL**: a view cannot be linked to,
shared, bookmarked or reloaded into, the browser's back button leaves the app, and
there are no per-view page titles. A school cannot send a payer a link to their
fee, and a payer who reloads loses the page they were on.

This is the one Flowtick section (routing and metadata) that this app simply does
not implement. It is recorded as a gap in the app's
`docs/PRODUCTION_QUALITY.md` and in the audit
`schoolfees-docs/docs/audits/2026-10-01-08-design-review.md`.

## Scope

- Real paths, not hash fragments: `/`, `/create`, `/lookup`, `/fee/[id]`,
  `/pay`, `/school`, and a branded unknown-path view.
- Read the location on load, listen to `popstate` for back/forward, push state on
  navigation, and scroll to the top on a route change.
- Preserve native behaviour on modifier clicks (Ctrl/Cmd/Shift/middle click must
  still open a new tab).
- Per-view `document.title` and meta description, describing the view honestly.
- Document — but do not invent — the host rewrite requirement: a static host must
  serve `index.html` for unknown paths, and the moment this lands the site needs
  that rule (Flowtick §4).

Out of scope: server-side rendering, a routing dependency unless it is justified
and recorded, analytics, changing the visual design, and anything that keeps more
state across a reload than the wallet address already kept by the kit.

## Acceptance criteria

- [ ] Every view has its own path, and a pasted deep link renders that view on first load.
- [ ] Reloading any path works locally and (once deployed) on the live site.
- [ ] Back and forward move between views.
- [ ] Ctrl/Cmd-click on any internal link opens a new tab without being intercepted.
- [ ] An unknown path shows a branded, honest "not found" view — not a blank page and not a silent redirect home.
- [ ] The tab title and meta description change with the view.
- [ ] Path parsing is a pure function with unit tests, including an unknown path and a malformed fee id.
- [ ] `docs/PRODUCTION_QUALITY.md` (the "no custom 404" and "per-view title" rows) and `docs/DEPLOYMENT_CHECKLIST.md` §5 (the host rewrite item) are updated to match.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass.

## Where to start

`src/App.tsx` (`PageId`, `NAV`, the page switch), `src/pages/shared.ts` for the
props every page already takes, `src/lib/validation.ts` for fee-id validation, and
`docs/PRODUCTION_QUALITY.md` §1–§2 for what is currently deferred.

## How to test

```bash
npm run build && npm run preview
```

Then open each path directly, reload each one, use back/forward, and try an
unknown path.

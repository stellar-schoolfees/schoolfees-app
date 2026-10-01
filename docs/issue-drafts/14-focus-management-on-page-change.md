# Move focus, and announce the change, when the page changes

**Difficulty:** easy
**Labels:** good first issue, area:app

## Problem

Navigation is a row of buttons that swap the contents of `<main>` in place
(`src/App.tsx`). Clicking one **leaves focus on the nav button** and changes
everything below it. For a keyboard user, the next Tab goes on through the header
rather than into the new page, and there is nothing to tell a screen reader that
the content changed at all. For a screen-reader user the announcement never
happens.

The same is true after a write: the result appears below the form and focus stays
on the submit button.

This is the accessibility gap recorded in the app's `docs/ACCESSIBILITY.md` §2 and
reported in `schoolfees-docs/docs/audits/2026-10-01-07-accessibility-review.md`. It
is a WCAG 2.2 concern under "focus order" and "page/section change" and it has a
standard remedy.

## Scope

- On a page change, move focus to a sensible target — the new page's `<h1>` (with
  `tabIndex={-1}`) or `<main>` — and make sure the outline behaves for both mouse
  and keyboard users (no focus ring flashing on a pointer click).
- Announce the change for assistive technology, without stealing focus
  mid-reading.
- Decide whether a write's result should also receive focus or be announced;
  recommend announcing it rather than moving focus away from the form the user
  may still need.

Out of scope: the automated accessibility test suite (draft 07), a visual
redesign, and the screen-reader audit itself, which is a human step and must be
recorded as such when it is done.

## Acceptance criteria

- [ ] After clicking a nav item, focus is on the new page's heading or main region, and the skip link still works.
- [ ] The change is announced to assistive technology (a polite live region or an equivalent that is actually announced).
- [ ] No visible focus ring appears on the target when navigation was a mouse click, but it does stay visible for keyboard activation.
- [ ] A write result is announced and does not steal focus from the form.
- [ ] `docs/ACCESSIBILITY.md` §2 and the "known deviations" list in `docs/DESIGN_GUIDELINES.md` §7 are updated.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass.

## Where to start

`src/App.tsx` (the `NAV` buttons and the page switch), `src/components/Field.tsx`
for the existing `aria-describedby` house style, and `docs/ACCESSIBILITY.md` §2 for
the exact wording of the gap.

## How to test

```bash
npm run dev
```

Tab to a nav item, press Enter, and check where focus lands. Then confirm with a
screen reader (NVDA on Windows) that the new page is announced.

# Accessibility — schoolfees app

The baseline this app targets and the honest state of each item. Adapted from
the Build Arsenal `ACCESSIBILITY.md` and Flowtick §3 to this app.

**Target: WCAG 2.2 level AA.** This is a static, single-page fee app with no
video, no audio, no drag-and-drop, no time limits and no authentication forms,
so most of WCAG is not applicable; what remains is listed below.

**Status: semantic markup and automated axe render checks, not an accessibility
audit.** The 2026-10-07 full suite passed with component/page axe checks in
happy-dom. No screen-reader audit or real-browser keyboard/zoom walkthrough
has been run. Automated checks do not establish WCAG conformance.

## 1. Structure and semantics

| Requirement | Status | Where |
|---|---|---|
| Real `<button>` elements for actions, never `<div onClick>` | built in | `App.tsx`, all pages and components |
| One `<h1>` per page, headings in order | built in | each page's `<section>`; `h2` only inside cards |
| Landmarks: `<header>`, `<nav aria-label="Main">`, `<main id="main">`, `<footer>` | built in | `App.tsx` |
| A skip link to the main content | built in | `App.tsx` (`.skip-link`, visible on focus) |
| Lists as `<ul>`/`<ol>`, form controls with real `<label>`s | built in | `Field.tsx`, `ConnectPage.tsx` |
| A language declared | built in | `<html lang="en">` in `index.html` |
| Page title describes the page | built in | `<title>schoolfees (testnet)</title>`; per-view titles do not exist because there is no routing ([draft 12](issue-drafts/12-url-routing-and-deep-links.md)) |

## 2. Keyboard and focus

| Requirement | Status | Where / gap |
|---|---|---|
| Everything operable without a mouse | built in | no hover-only affordance; no custom widgets |
| Visual order matches tab order | built in | single column, no absolute positioning of controls |
| Visible `:focus-visible` on every interactive element, never `outline: none` | built in | 3px `--focus-ring` outline, 2px offset, for buttons, links and inputs |
| A strong focus state on invalid inputs | built in | `.field input[aria-invalid='true']:focus-visible` switches the outline to the error colour |
| **Focus moves sensibly after navigation** | **gap** | clicking a nav item re-renders `<main>` while focus stays on the nav button; nothing announces that the page changed ([draft 14](issue-drafts/14-focus-management-on-page-change.md)) |
| **Focus returns somewhere useful after an action** | **gap** | a write's result appears below the form; focus stays on the submit button. Same draft |
| Focus never gets trapped | built in | no dialogs, no focus traps, no `tabindex` other than the skip link and `main` |
| Enter saves / Escape cancels in inline edit | n/a | there are no inline editors |

## 3. Screen readers

| Requirement | Status | Where / gap |
|---|---|---|
| Fields expose label, hint and error programmatically | built in | `Field.tsx` wires `aria-describedby` to the hint and error ids and sets `aria-invalid` |
| Errors announced | built in | `role="alert"` on field errors, notices and wallet errors |
| Dynamic status announced without stealing focus | built in | the TESTNET banner is `role="status"` (`aria-live="polite"`); write results are rendered as text after the form |
| Current page indicated | built in | `aria-current="page"` on the active nav button |
| Status meaning | built in | StatusBadge has screen-reader text; FeeSummary also renders the full explanation visibly |
| Shortened hash/address readable in full | built in | WalletBar and TransactionResult expose full values as screen-reader text; result is a polite status |
| Decorative content hidden | n/a | there is no decorative imagery, and no icon font — the app has no images at all |
| Icon-only buttons labelled | n/a | there are no icon-only buttons |

## 4. Colour and contrast

| Requirement | Status |
|---|---|
| Body text ≥ 4.5:1 | built in — `--ink` on `--bg` and on `--card` are far above the minimum |
| Secondary/hint text ≥ 4.5:1 | built in — `--muted` (#475467) on white and on `--bg` |
| Testnet banner text ≥ 4.5:1 | built in — `--banner-ink` on `--banner-bg` (#7c2d12), and the accent tag `--banner-accent` on the same background is about 6.5:1 |
| Status badge text ≥ 4.5:1 per tone | built in — each badge ink is a dark tone per background |
| Focus indicator ≥ 3:1 against adjacent colours | built in — `--focus-ring` (#1849a9) on the light surfaces; on the dark banner no focusable element sits |
| Placeholder text | uses the muted token; rendered contrast not audited |
| Colour never the only signal | built in — statuses carry words, errors carry text |
| Light and dark | deliberate: `color-scheme: light` and one light palette. A dark theme is not built and is not claimed |

## 5. Motion

| Requirement | Status |
|---|---|
| Motion explains state changes only | built in — colour transitions on hover/disabled, nothing moving across the screen |
| `prefers-reduced-motion: reduce` respected | built in — `* { transition: none !important; animation: none !important; }` |
| No animation that delays a task | built in — no animation at all beyond short colour transitions |
| No auto-playing or looping content | built in |

## 6. Targets, layout and zoom

| Requirement | Status |
|---|---|
| Touch targets: project 44px minimum | built in CSS for buttons/nav; inputs 46px; browser geometry not audited |
| No horizontal scrolling at 390px | verified in a browser during development at 390×844; the CSS uses flexible wrapping and `overflow-wrap: anywhere` for long mono values |
| Text reflows at 320px / 200% zoom | by construction (relative units, no fixed widths beyond `--max-width`); **not explicitly checked** |
| Orientation is not locked | n/a — the page is not orientation-locked |
| Nothing relies on colour, shape or position alone | built in |
| Content is readable without styling | yes — semantic markup and plain text; the app is usable with CSS disabled, though visually plain |

## 7. What must be checked by a person

None of the following can be verified from the code, and none of it has been
done. This is the shortest honest list of what a human should check by eye, and
it is repeated in the audit under "what was NOT checked":

1. **Screen reader spot check** (NVDA on Windows, VoiceOver on macOS): does the
   hint read out before the error, is the connect button announced once, is the
   fee summary understandable as a description list?
2. **Keyboard-only pass**: tab through all five pages; does focus stay visible;
   does the skip link work; is the tab order the visual order?
3. **Does anything announce the page change** when a nav item is clicked
   (expected answer today: no — draft 14).
4. **Nav pill tap size** at 390px: verify the CSS 44px minimum in the rendered layout.
5. **Placeholder legibility** on a real phone in daylight.
6. **Zoom to 200%** at 320px width: any clipping?
7. **Reduced motion** turned on at the OS level: confirm nothing animates.
8. **Status explanation**: verify the visible summary explanation and screen-reader badge text.

## 8. Rules for new UI

- Semantic element first. If it is clickable it is a `<button>`; if it navigates
  it is an `<a href>`.
- Every input gets a `<label>`; never a placeholder standing in for a label.
- Every error is text, associated with its field, and announced.
- Every interactive element keeps a visible focus state. Removing an outline
  requires an equal or better replacement in the same change.
- Never rely on colour or a `title` attribute alone to convey meaning.
- Check any layout change at 390px and with the keyboard before calling it done.
- If a dialog or a dynamic list is ever added, it needs the full treatment:
  focus trap and return, `aria-live` for updates, and labelled controls.

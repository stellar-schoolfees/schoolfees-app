# Design guidelines — schoolfees app

The design rules this app is held to, and the ones it currently breaks. Adapted
from the Build Arsenal `DESIGN_GUIDELINES_TEMPLATE`, `TOKENS`, `TYPOGRAPHY`,
`COMPONENTS` and `MOTION` to a small, calm, testnet-only fee app.

Audience first: school or tutorial centre staff and parents, on a phone, often
in a hurry, on a slow connection. Nothing here is a portfolio piece.

## 1. Visual direction

- **Calm and product-first.** One neutral ramp, one accent, one tone per status.
  The most visually prominent surface on every screen is the TESTNET warning
  bar, because "this is not real money" is the single most important thing a
  reader must know.
- **Plain words, specific claims.** Copy says what the contract does. No
  marketing adjectives, no promises about safety, no "bank-grade".
- **The record is the product.** The fee summary shows everything the contract
  stores — total, paid, refunded, still owed, due date, closed flag, school,
  token, reference — rather than a flattering subset. Amounts and dates are
  public on-chain and the UI says so.
- **Honest over polished.** Where a value is unknown (an unrecognised status, a
  missing return value), the app says so instead of guessing.
- **Consistent spacing and hierarchy.** Spacing comes from one scale (CSS
  variables and relative units), one heading order per page, one card shape,
  one notice shape.
- **Restrained motion.** Motion only explains a state change (a hover, a
  disabled control). Nothing animates for decoration.

## 2. What to avoid

- Generic gradients, glows, glassmorphism, hero illustrations.
- Decorative clutter: badges for their own sake, icons that carry no meaning,
  cards inside cards.
- **Any fake proof**: no testimonials, no user counts, no stats, no partner
  logos, no invented schools, no "trusted by". The app has none and must not
  gain any.
- Placeholder statistics or "coming soon" marketing.
- Generic AI-product patterns: chat bubbles, "Ask AI", sparkle icons, a
  gradient CTA, skeleton loaders for content that never loads.
- Motion with no purpose, and anything that ignores `prefers-reduced-motion`.
- Dark patterns: nothing that hides the network, softens the testnet warning,
  pre-fills an amount the user did not choose, or makes "Sign and pay" the
  visually dominant thing on the page without the fee summary above it.

## 3. Tokens

Defined once, in `:root` in [`src/index.css`](../src/index.css). Extend the set
only when a real need appears; keep it small.

| Group | Tokens |
|---|---|
| Neutral ramp | `--ink`, `--ink-soft`, `--muted`, `--line`, `--line-strong`, `--bg`, `--card` |
| Accent | `--accent` (#1d4ed8), `--accent-strong`, `--accent-soft`, `--focus-ring` |
| Status tones | `--ok-*`, `--warn-*`, `--err-*` (background / line / ink per tone) |
| Testnet banner | `--banner-bg` (#7c2d12), `--banner-ink`, `--banner-accent` |
| Shape | `--radius`, `--radius-sm`, `--shadow-sm`, `--shadow-md` |
| Layout | `--max-width` (46rem), `--pad` |

Status colour is **never the only signal**: every badge and notice carries words
(`Open`, `Paid`, `Overdue`, `Closed`, `Unknown`) as well as a tone.

## 4. Typography

- **System font stack only** — no web fonts, therefore no font licence to verify
  and no third-party font request. This is a deliberate constraint, not an
  oversight.
- One body size (16px/1.6) as the base; a `clamp()` display size for `h1`; a
  single smaller size for hints and errors (0.85–0.88rem).
- Monospace for anything a user must copy or compare exactly: addresses, hashes,
  references, amounts, with `overflow-wrap: anywhere` so a long value cannot
  break the layout.
- Labels are real `<label>` elements and are never replaced by a placeholder.
- Long-form copy lives in components, not in CSS.

## 5. Components and states

Documented here because they exist in code today, not as an aspiration.

| Component | File | States |
|---|---|---|
| `Field` | `src/components/Field.tsx` | label, hint, error (`aria-invalid` + `aria-describedby` + `role="alert"`), required, disabled, mono |
| Buttons | `src/index.css` | default, hover, `:focus-visible` (3px outline, 2px offset), disabled (0.55 opacity, not-allowed), secondary variant, full-width under 34rem |
| Nav pills | `src/App.tsx` + CSS | default, hover, `aria-current="page"` (filled) |
| Banner | `src/components/TestnetBanner.tsx` | static, `role="status"` |
| Notices | `src/index.css` | neutral, error (`--err-*`), ok (`--ok-*`), each with a `notice-title` |
| Badges | `src/components/StatusBadge.tsx` | one tone per status, plus `Unknown` |
| Fee summary | `src/components/FeeSummary.tsx` | `dl` grid, one column on phones, two from 30rem |
| Transaction result | `src/components/TransactionResult.tsx` | label, shortened hash, explorer link |
| Connect prompt | `src/components/ConnectPrompt.tsx` | one per page that needs a wallet |
| Config notice | `src/components/ConfigNotice.tsx` | replaces the whole app when the environment is wrong |

**Loading and empty states:** every action button swaps its label to `Loading…`
(or `Connecting…`) and disables while busy; pages that need a wallet show the
connect prompt instead of an empty form; a lookup that fails shows reviewed
`ERRORS.md` wording rather than a blank area. There is no "no results yet" state
because there are no lists in v0 — if a list is added (draft 06), it must come
with a designed empty state per filter, and the app must distinguish "nothing
yet" from "no results" from "failed to load".

## 6. Mobile

- Mobile-first CSS: base styles target small screens, `min-width` media queries
  only ever add.
- Reference small screen is **390×844**; the layout must not scroll horizontally
  at that width or above (verified in a browser during development at 390px).
- Body text never below 16px; touch targets at least 44×44px (see
  [`ACCESSIBILITY.md`](ACCESSIBILITY.md) for the target and verification limits).
- Inputs are 46px tall with `inputmode="numeric"` where the value is numeric.
- Actions go full width below 34rem.
- No hover-only affordance.

## 7. Known deviations

Recorded rather than hidden; all are in the audits under
`schoolfees-docs/docs/audits/`.

| Where | Deviation | Tracked by |
|---|---|---|
| Global | No URL routing, so no per-view titles and no deep links (Flowtick §4). | [draft 12](issue-drafts/12-url-routing-and-deep-links.md) |

## 8. Adding UI

- Put the logic in `src/lib/`, the markup in `src/components/` or
  `src/pages/`, and the styling in `src/index.css`. No inline style objects.
- No new colour, spacing or radius value: use a token, or add one to `:root`
  with a reason.
- No new dependency for a visual effect. No icon library, no animation library.
- Any new user-visible string must match the reviewer's rules: it describes what
  the code does, and error wording is never written here — it comes from
  `ERRORS.md` through `src/lib/contractErrors.ts`.
- Check it at 390px and with the keyboard before calling it done.

## 2026-10-07 fixes

Home leaves connection controls in the header and accurately states that lookup
requires a wallet without signing. FeeSummary shows the full status explanation
as visible text. Existing nav targets are 44px and placeholder text uses the
muted token. Pay/refund/close already refresh the summary; they are not pending
features. Keyboard and narrow viewport behaviour still need browser validation.

# Printable receipt for a payer

**Difficulty:** easy
**Labels:** good first issue, area:app

## Problem

After a payment the app shows a transaction hash and an explorer link. That is
proof, but it is not a receipt: a parent cannot print it, and school staff often
need something on paper for their own records. The UK-style "show the hash"
answer is right for developers and wrong for a bursar.

## Scope

Add a printable summary for one fee — total, paid, refunded, remaining, status,
due date, reference, and the transaction hash of each action of this session —
styled with a print stylesheet so it prints cleanly without the navigation.

Out of scope: PDF generation libraries, emailing anything, or storing receipts
anywhere. The browser's own print dialog is the whole feature.

## Acceptance criteria

- [ ] A "Print this summary" action exists on the fee views.
- [ ] The printed page includes the TESTNET banner text, and omits navigation and buttons.
- [ ] No amount is shown in a unit the page does not name.
- [ ] No hidden personal data is added to the page.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass.

## Where to start

`src/components/FeeSummary.tsx`, `src/pages/LookupFeePage.tsx` and
`src/index.css` (an `@media print` block). Read the privacy rules in `AGENTS.md`
before adding any field.

## How to test

```bash
npm run build
```

Open the built app, use the print preview, and confirm nothing from the
navigation or the button areas appears on the page.

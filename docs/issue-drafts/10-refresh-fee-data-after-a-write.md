# Refresh a fee's data after a successful write

**Difficulty:** easy
**Labels:** good first issue, area:app

## Problem

`PayPage` and `SchoolActionsPage` load a fee once, show it in `FeeSummary`, and
then submit a payment, refund or close. After the transaction succeeds the
summary **above the form still shows the values from before the action**, and
nothing says they are stale. So a payer who has just paid still sees the full
"Still owed" figure and the prefilled amount, and a school that has just refunded
or closed still sees the old totals. The next action is built from the old record
too, because `submit()` uses `loaded.fee` captured at lookup time.

Nobody has hit this yet — the app has never run against a deployed contract — but
it is exactly the confusion that leads to a second real payment.

## Scope

After a successful write, re-read the fee (`get_fee` and `status`) and update the
summary, or — if re-reading is deliberately not done — mark the summary as
showing values from before the action, in plain words matching the app's tone.

Prefer re-reading: the contract is the source of truth and the app already has
`client.getFee` / `client.getStatus`. Keep the existing error mapping and the
existing busy/disabled handling. Wording for a failed refresh must not invent a
contract code — use the existing `describeContractError` path.

Out of scope: a live subscription or polling loop, caching, and any change to the
contract.

## Acceptance criteria

- [ ] After a successful payment, refund or close, the fee summary shows the post-transaction record (or is explicitly labelled as pre-transaction).
- [ ] The amount prefilled on `PayPage` is not a stale "still owed" figure after a successful payment.
- [ ] A failure to refresh shows a mapped error and does not hide the successful transaction hash.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass.
- [ ] `docs/TESTING.md` and `docs/DESIGN_GUIDELINES.md` are updated if the behaviour or the "known deviations" list changes.

## Where to start

`src/pages/PayPage.tsx` (`lookup`, `submit`) and
`src/pages/SchoolActionsPage.tsx` (`lookup`, `submitRefund`, `submitClose`);
`src/lib/contract.ts` has `getFee` and `getStatus`. `docs/SECURITY.md` §6 covers
why a stale view is a duplicate-submission risk.

## How to test

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Then, once a contract is deployed, pay a fee on testnet and confirm the summary
updates without a manual reload.

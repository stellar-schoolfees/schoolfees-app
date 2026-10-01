# Reads in the app never keep a fee record alive

**Difficulty:** medium
**Labels:** help wanted, area:app

## Problem

The contract extends the TTL of every entry it touches, and its documentation
says reads extend too — with an explicit caveat in
`docs/design/interface-v0.md` §4: *"reads extend too, so `get_fee`/`status`
submitted as transactions keep records alive (simulations do not persist
extensions)."*

The app **only simulates reads**. `src/lib/contract.ts` `read()` builds a
transaction, calls `server.simulateTransaction` and returns the return value; the
transaction is never signed or submitted, so the TTL extension the contract
performed during simulation is discarded. Writes (`pay`, `create_fee`, `refund`,
`close_fee`) do go on-chain and therefore do extend.

Consequence: the archival mitigation that the docs lean on partly does not apply
to the app's own users. A payer who looks up a fee every week is not preventing
that fee from archiving after roughly `due_at + 30 days`. Nothing is broken today
— no contract is deployed and no record exists — but the docs repo currently
describes a protection the app cannot benefit from, and a pilot participant
browsing a long-idle fee would hit the "archived record, the app cannot restore
it" message.

## Scope

Pick one, and make the documentation match:

- **A — document it as a limitation.** State in `docs/TESTING.md` /
  `docs/SECURITY.md` and in the app README that browsing does not keep a record
  alive, so the "records outlive their deadline" claim applies to on-chain
  interactions only. Smallest correct change.
- **B — submit an extend transaction** when a read shows a record close to
  archival, which depends on the contract gaining a public extend entrypoint
  (`schoolfees-contracts/docs/issue-drafts/07-extend-ttl-entrypoint.md`). That
  costs the user a transaction fee and a signature for something they did not ask
  for, so it is a product decision as much as a technical one.
- **C — leave it**, if the pilot's fee lifetimes never approach the archival
  horizon, and record that reasoning.

Out of scope: any change to the contract's TTL constants, and any automatic
signing without the user's knowledge.

## Acceptance criteria

- [ ] A decision (A, B or C) is recorded with its reasoning.
- [ ] No document in any repository claims that browsing the app keeps a record
      alive when it does not.
- [ ] If A is chosen, the sentence in the docs repo's `limitations.md` and
      `threat-model.md` that says "every read and write re-extends the entries it
      touches" is qualified for app reads.
- [ ] If B is chosen, the extra transaction is explicit in the UI, never silent,
      and covered by a new test and by `docs/SECURITY.md`.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass.

## Where to start

`src/lib/contract.ts` `read()` and `assemble()` (the difference between them is
exactly this issue), `docs/design/interface-v0.md` §4 in the contracts repo for
the TTL policy, and the contracts draft `07-extend-ttl-entrypoint.md`.

## How to test

```bash
npm test
```

Then, against a deployed contract, read a fee repeatedly and observe that no
transaction is submitted (and therefore no TTL extension is persisted).

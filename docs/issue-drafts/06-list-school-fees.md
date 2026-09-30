# List a school's fees

**Difficulty:** hard
**Labels:** help wanted, area:app

## Problem

The contract has no list function: every lookup is keyed by fee id or by the
`(school, reference)` pair, and `docs/design/interface-v0.md` says so
explicitly. A school therefore cannot see its own fees in the app without
already knowing each id, which makes the record awkward to use as a register of
what is outstanding.

## Scope

Build a read-only view of a school's fees by reading the `FeeCreated` events for
that school from RPC and then loading each fee record, with pagination over
ledger ranges.

Out of scope: changing the contract to add a list or index, and relying on any
third-party indexer service (this project has no backend).

## Acceptance criteria

- [ ] The view lists fees for the connected address, newest first, with paging.
- [ ] It says plainly that the list comes from events, which can be missed, and is therefore not authoritative.
- [ ] A fee whose record has been archived is shown as such rather than silently dropped.
- [ ] Rate limits and empty results are handled without an unbounded request loop.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass.

## Where to start

The event layouts are in `docs/events.md` in `schoolfees-contracts`
(`fee_created`, with `fee_id` as the topic). The SDK exposes event queries on
`rpc.Server`. `src/lib/contract.ts` is where the client lives.

## How to test

```bash
npm test
npm run build
```

Add offline unit tests for the paging and de-duplication logic, then check the
view against testnet once a contract is deployed.

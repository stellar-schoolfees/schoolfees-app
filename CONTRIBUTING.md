# Contributing

Thanks for helping with the `schoolfees` app. **Read [AGENTS.md](AGENTS.md)
first** — it is the rulebook for this repository, for people and for AI agents
alike. This page is a shorter orientation.

## Before you change anything

- **Testnet only.** Never write anything that suggests mainnet use.
- **Nothing is deployed and no pilot has happened.** Do not describe a
  deployment, a contract id, a school, a tester or a result that does not exist.
- **No personal data, ever** — not in examples, not in tests, not in issue
  drafts. Use obvious placeholders such as `ref_0001`.
- **Never commit `.env`**, a secret key or a seed phrase. The app never asks for
  one; keep it that way.

## Checks to run before you push

```bash
npm run lint        # oxlint
npm run typecheck   # tsc -b, strict
npm test            # vitest
npm run build       # production build
```

CI runs exactly these four. A change that breaks any of them is not ready.

## Where things belong

- **Pure logic goes in `src/lib/`, with a test next to it.** Formatting,
  validation, error mapping, fee rules and ScVal conversion all live there and
  are unit tested offline, with no network and no wallet.
- **`src/components/` and `src/pages/` are UI only.** No business logic, and no
  contract calls outside `src/lib/contract.ts`.
- **Error wording is never written here.** Add or change messages only via the
  code-and-wording table in `src/lib/contractErrors.ts`, and keep
  `docs/contract-errors.md` in step with `ERRORS.md` in `schoolfees-contracts`.
- **Dependencies need a reason.** If you add one, say why in the pull request,
  and check its maintainer and recent releases first.

## TypeScript

- Strict mode is on. No `any` without a comment explaining why it is needed.
- `erasableSyntaxOnly` is on: no `enum`, no parameter properties, no namespaces
  in this codebase. Use union types and `as const` objects instead.
- Prefer `bigint` for amounts: the contract uses `i128` and the SDK converts
  those to `bigint`, never to `number`.

## Accessibility and honesty in the UI

- Label every input; never use a placeholder as a label.
- Keep the TESTNET banner visible on every screen.
- Keep the plain-words warning on the reference field: names, phone numbers,
  emails and student ids must never be entered there.
- Never soften the app's stated limits. If something is unverified, say so — the
  README section "What is proven vs assumed" is the model.

## Commits

- Small commits with clear messages.
- No `Generated with ...` or co-author trailers.
- Do not rewrite history, change remotes, or push on someone else's behalf.

## Ideas and unimplemented work

Record unimplemented work in [ROADMAP.md](ROADMAP.md) and as a draft under
`docs/issue-drafts/`, using the template in `AGENTS.md`. Do **not** open a GitHub
issue for it yourself — the maintainer decides what becomes an issue.

## License

By contributing you agree your work is licensed under the MIT license in
[LICENSE](LICENSE).

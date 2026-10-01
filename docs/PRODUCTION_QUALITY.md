# Production quality — schoolfees app

The polish checklist for the built site, with the current state of each item.
Adapted from the Build Arsenal `PRODUCTION_QUALITY_TEMPLATE` and
`SEO_TEMPLATE`.

Nothing here is deployed. "Deferred" always names what it is waiting for, and
**no domain, URL, address or contact is ever invented to fill a gap** — an
invented canonical URL or sitemap is worse than none.

## 1. Content and shell

- [x] **No framework starter content.** `index.html` carries no Vite or React
      branding, there is no `src/assets/`, no `vite.svg`/`react.svg` reference
      anywhere, and the shell is the real app (`p app-title` "schoolfees", a
      real nav, a real footer). Verified by grep on 2026-10-01.
- [x] `index.html` has `<html lang="en">`, `<meta charset>`, a viewport meta, and
      `<meta name="color-scheme" content="light">`.
- [x] No placeholder prose ("lorem ipsum", "TODO: fill in") in any shipped
      string.
- [x] Footer states the real status: testnet only, not audited, no pilot, nothing
      deployed until a school agrees.
- [ ] **No custom 404 view.** Not applicable yet: the app is a single document
      with no client-side routes, so an unknown path cannot be reached from
      inside it. The nearest equivalent already exists — a broken configuration
      renders `ConfigNotice` instead of the app. A branded 404 becomes a real
      requirement the moment routing is added
      ([draft 12](issue-drafts/12-url-routing-and-deep-links.md)), together with
      the host rewrite rule (Flowtick §4).

## 2. Titles, metadata and icons

| Item | State |
|---|---|
| Page title | `schoolfees (testnet)` — accurate, and it says "testnet" on purpose |
| Meta description | present, describes the app and says "Not real money". Pre-existing; unchanged by this task |
| `<meta name="theme-color">` | present (`#7c2d12`, matching the TESTNET banner) |
| Per-view titles and descriptions | **n/a today** — there is no routing, so there is one view. Required once routing exists ([draft 12](issue-drafts/12-url-routing-and-deep-links.md)) |
| **Favicon** | **missing** — no `favicon.ico`, no `public/` directory, no `<link rel="icon">`. A browser shows a default icon. Tracked as [draft 16](issue-drafts/16-favicon-and-social-metadata.md) |
| Open Graph / Twitter card metadata | **deferred** — needs a real public URL to point at. Not invented |
| `llms.txt` | **n/a** — no reason for one on a pilot fee app |
| Structured data (`LocalBusiness`, reviews, ratings, prices) | **n/a and forbidden** — never invent an organisation, an address or a review |
| `canonical` | **deferred until a real domain exists.** No domain is assumed anywhere in the repo |
| `robots.txt` | **deferred** — the same reason. Nothing is deployed, so there is nothing to index; when there is, the one deliberate decision is whether the pilot site should be `noindex` at all |
| `sitemap.xml` | **deferred** — needs a domain and real routes |

## 3. Links, console and errors

- [x] No broken internal links: the app has no internal links. The only links
      are the explorer links built by `src/lib/explorer.ts`, which are covered by
      unit tests (`explorer.test.ts`).
- [x] External links use `target="_blank" rel="noreferrer noopener"`.
- [x] No `console.*` call exists anywhere in `src/` — the app logs nothing. The
      intended console state is therefore "clean by construction".
- [ ] **Clean console on the deployed build: not verified.** No deployment
      exists. It is item §4 of the app's
      [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md).
- [x] No unhandled-promise landmine in the render path: every async action goes
      through `useAction`, which catches and maps.

## 4. Build, assets and bundle

| Item | State |
|---|---|
| Production build | passes: `dist/index.html` + `dist/assets/*` |
| **Bundle size** | **known issue** — the initial chunk is **1,045.82 kB (263.24 kB gzipped)**, which triggers Vite's own >500 kB warning. Caused by the wallet kit's multi-chain module set. Tracked as [draft 02](issue-drafts/02-code-split-wallet-kit.md) |
| Other chunks | `client` 66.02 kB, `sac-spec` 9.79 kB, `utils` 0.51 kB, CSS 6.97 kB |
| **Source maps** | **none shipped**, which is the default and is the right choice for this app: a source map would publish the full source of a security-sensitive client. Shipping them would be a deliberate, documented decision |
| Images | **none at all** — no `<img>`, no background images, no icon font. So no image optimisation or alt-text work is pending; the CSS deliberately uses no imagery |
| Web fonts | **none** — system font stack only, so no font licence and no third-party font request |
| CSS | one stylesheet (`src/index.css`, ~500 lines), no framework, no CSS-in-JS |
| Dead CSS | not measured; low risk at this size |

## 5. Hosting and headers

- [ ] Static host chosen **by Tim** (see the deployment checklist §7). Not
      decided here.
- [ ] HTTPS and a redirect from http: the host's default; confirm after
      deploying.
- [ ] **No `Content-Security-Policy` yet.** There is no hosting configuration to
      put one in. When there is, the policy this app wants is:
      `default-src 'self'`; `script-src 'self'`; `style-src 'self' 'unsafe-inline'`
      (the app injects no styles, but Vite's build does not inline any either —
      narrow this once measured); `img-src 'self' https://stellar.creit.tech
      https://scopuly.com https://uni.onekey-asset.com` (the wallet icons, see
      [`SECURITY.md`](SECURITY.md) §8); `connect-src 'self' <the RPC URL from
      .env>`; `frame-ancestors 'none'`; no `unsafe-eval`.
- [ ] Decide whether `Referrer-Policy: no-referrer` and
      `X-Content-Type-Options: nosniff` are set (both are free wins).

## 6. Deployment verification (n/a until something is deployed)

- [ ] All routes 200 on the live URL — there is exactly one route today.
- [ ] Deep-link refresh — n/a without routes.
- [ ] Static assets resolve with the right content types.
- [ ] Clear `localStorage` and reload: the app renders the connect state
      gracefully (the only stored values are the wallet kit's own keys).
- [ ] Network tab: no 4xx/5xx beyond the intended RPC calls.
- [ ] Mobile viewport on the live site.

## 7. The short version

Ready now: no starter content, accurate title and description, theme colour,
no source maps, no fonts, no images, no broken links, no console calls, a
production build that passes, and an honest status line in the footer.

Outstanding, and why: a favicon (nobody has drawn one), a smaller bundle
(waiting on a wallet-kit decision), and everything that needs a domain or a
deployment — canonical URL, `robots.txt`, `sitemap.xml`, social cards, hosting,
headers and the live smoke test. None of those are guessed at, and none of them
block the pilot.

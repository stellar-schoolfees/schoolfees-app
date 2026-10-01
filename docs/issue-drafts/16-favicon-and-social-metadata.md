# Add a favicon, and decide the social metadata that does not need a domain

**Difficulty:** easy
**Labels:** good first issue, area:app

## Problem

The app ships no favicon and no `public/` directory: there is no
`<link rel="icon">` in `index.html` and nothing for a browser to use, so a tab and
a bookmark show a generic blank icon. Everything else in the head is already
right (title, description, `color-scheme`, `theme-color`).

Several other production-metadata items are deliberately **deferred**, and are
listed here so that nobody fills them in by inventing a value:

| Item | Why it waits |
|---|---|
| canonical URL | needs a real domain, which does not exist |
| `sitemap.xml`, `robots.txt` | same, plus there is nothing deployed to crawl |
| Open Graph / Twitter cards | need an absolute public URL for `og:url` and `og:image` |
| per-view titles and descriptions | need routing — see draft 12 |

`docs/PRODUCTION_QUALITY.md` §2 records all of this.

## Scope

- Add a favicon (a small SVG is enough; an `.ico` fallback is optional), link it
  from `index.html`, and keep it consistent with `--banner-bg` (#7c2d12) and the
  app's visual language.
- Keep the icon **local** — no icon-host request, and no new dependency for it.
- Add a static social card image **only if** it can be done without inventing a
  URL; otherwise leave the tags out and keep the deferral documented.

Out of scope: registering a domain, adding a canonical URL or a sitemap, adding
any icon library or font, and any change to the app's behaviour.

## Acceptance criteria

- [ ] The build output contains the icon and `index.html` links it with a relative path.
- [ ] The favicon is requested from the app's own origin — no third-party host.
- [ ] No new dependency is added.
- [ ] `docs/PRODUCTION_QUALITY.md` §2 no longer lists the favicon as missing, and still lists the domain-dependent items as deferred, with the reason.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass; `index.html` changes do not break the build.

## Where to start

`index.html` (the head), `src/index.css` `:root` for the palette,
`docs/PRODUCTION_QUALITY.md` §2 and §7.

## How to test

```bash
npm run build && npm run preview
```

Then confirm the tab icon appears, and that the network tab shows the icon coming
from the preview origin.

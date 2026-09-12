# koray.dev

Personal site. [AstroPaper](https://github.com/satnaing/astro-paper) v6, used as
the theme rather than forked into something else, with this site's own palette,
content and identity on top.

## What is ours and what is the theme's

Keeping this boundary clear is what makes the next theme upgrade cheap.

| Ours                                                                                    | The theme's                                  |
| :-------------------------------------------------------------------------------------- | :------------------------------------------- |
| `astro-paper.config.ts` — domain, author, timezone, socials, share links, feature flags | every component under `src/components/`      |
| `src/styles/theme.css` — the seven colour tokens, light and dark                        | `src/styles/global.css`, `typography.css`    |
| `src/content/posts/` — the writing                                                      | every route under `src/pages/`               |
| `src/content/pages/` — `home`, `about`, `bookmarks`                                     | `src/utils/` except `schema.ts`, `src/i18n/` |
| `src/content/bookmarks.yaml` — the bookmark links, as data                              | `src/layouts/` structure                     |
| `src/utils/schema.ts` — all JSON-LD                                                     | everything else                              |
| `public/favicon.svg`, `public/apple-touch-icon.png`, `public/CNAME`                     |                                              |
| `.github/workflows/deploy.yml` — the Pages deploy                                       |                                              |

### Local edits against upstream

Each is marked with a comment explaining why. Keeping this list short is what
makes a theme bump a merge rather than a rewrite.

| File                                       | Edit                                                                                                                                                    |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/index.astro`                    | Hero copy read from the content collection; feed icon moved into the social row                                                                         |
| `src/components/Header.astro`, `src/i18n/` | The `Bookmarks` nav entry                                                                                                                               |
| `astro.config.ts`                          | Dark code theme; `/search/` filtered out of the sitemap                                                                                                 |
| `src/layouts/Layout.astro`                 | `schema` and `noindex` props; dead `favicon.ico` link removed; `og:locale`; static `theme-color`; `apple-touch-icon`; RSS href without a trailing slash |
| `src/layouts/PostLayout.astro`             | Post JSON-LD routed through the shared graph instead of its own block                                                                                   |
| `src/pages/search.astro`                   | Dev notice only when the index is genuinely missing, naming `bun run build`                                                                             |
| `src/content.config.ts`                    | `seoTitle` on pages; the `bookmarks` collection                                                                                                         |
| Listing and page routes                    | Page-specific JSON-LD, and the meta description the theme rendered but never set                                                                        |

## Commands

| Command                  | Action                                                      |
| :----------------------- | :---------------------------------------------------------- |
| `bun install`            | Install dependencies                                        |
| `bun dev`                | Dev server on `localhost:4321`                              |
| `bun run build`          | Type-check, build to `./dist/`, then index with Pagefind    |
| `bun run build:bun`      | Same, but `astro build` runs on the Bun runtime — see below |
| `bun run verify:runtime` | Builds both ways and diffs the OG images byte-for-byte      |
| `bun preview`            | Serve the build locally                                     |
| `bunx astro check`       | Type-check `.astro`, `.ts`, and content schemas             |
| `bun run format`         | Prettier                                                    |
| `bun run lint`           | ESLint                                                      |

Per `AGENTS.md`, start the dev server as `astro dev --background` and manage it
with `astro dev stop|status|logs`.

> **TypeScript stays on 6.x.** TypeScript 7's native compiler does not yet expose
> the programmatic API `astro check` relies on, so bumping it breaks both
> `astro check` and `bun run build`. Track
> [withastro/roadmap#1321](https://github.com/withastro/roadmap/discussions/1321).

## Deploying

GitHub Pages, built and published by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to
`main`. Nothing is committed to a branch; the workflow uploads `dist/` as a
Pages artifact.

**One setting is not in this repo:** Settings → Pages → **Source** must be
**GitHub Actions**. Without it the workflow runs green and publishes nothing.

The workflow is the official [`withastro/action`](https://github.com/withastro/action),
and three of its behaviours are what this project relies on:

- It finds `bun.lock` — the text lockfile Bun ≥ 1.2 writes — installs with Bun,
  **and separately installs Node** to run the build. That is exactly the split
  this project wants, with no configuration.
- It runs the package `build` script, so `astro check` and the Pagefind index
  both happen. Do not override `build-cmd` with a bare `astro build`: search is
  an index generated from `dist` _after_ the build, and `astro build` alone
  ships a site whose `/search` finds nothing.
- It publishes through `upload-pages-artifact` / `deploy-pages`, which serves
  the artifact as-is. **Jekyll never runs**, so `_astro/` is safe and
  `public/.nojekyll` is unnecessary. That file is folklore carried over from the
  old deploy-from-a-branch flow; do not add it back.

The branch-based limitation that made GitHub Pages a bad fit before — it only
served `/` or `/docs` from a branch, so you had to commit the build — does not
apply to the Actions flow.

### URL shape

`trailingSlash: "always"` in `astro.config.ts`, because a static host is
stricter than the dev server and the difference is easy to miss. `astro dev`
and `astro preview` both normalise a URL that a plain file host would reject,
so a link shape can look fine locally and cost a redirect — or a 404 — once
published. Two things this setting buys:

- Astro's `paginate()` stops emitting `/posts/2` while the sitemap and the
  canonical tag say `/posts/2/`. Every internal link, canonical URL and sitemap
  entry now agrees on one form.
- The dev server rejects the slash-less form, so the mismatch surfaces while
  you are working rather than after a deploy.

Routes with a file extension are exempt, so `/rss.xml` stays slash-less — which
matters, because `/rss.xml/` is a 404 on a real file host. The RSS
autodiscovery link in `Layout.astro` strips the slash that
`getRelativeLocaleUrl` appends for exactly that reason.

### Custom domain

[`public/CNAME`](public/CNAME) contains `koray.dev`, which is what binds the
domain; `site` in `astro-paper.config.ts` matches it and **`base` is
deliberately unset**.

DNS must point the apex at GitHub Pages' `A`/`AAAA` addresses. If the zone
stays on Cloudflare, keep those records **DNS-only (grey cloud)**: a proxied
record blocks the HTTP validation GitHub uses to issue the certificate, and the
site answers with a TLS error rather than a redirect, which reads like a DNS
problem and is not one.

> Dropping the custom domain is not a one-line change. The site would move to
> `https://raelsei.github.io/koray.dev/`, which makes `base: "/koray.dev"`
> mandatory and rewrites every internal URL. `site` and `base` must be changed
> together with the `CNAME`, or every asset 404s.

### Why Node builds this, not Bun

Bun is the package manager and script runner. It is **not** the build runtime:
`astro` and `pagefind` ship `#!/usr/bin/env node` shebangs, so `bun run build`
hands the actual work to Node. That is deliberate, and it is what
[Astro's Bun recipe](https://docs.astro.build/en/recipes/bun/) documents — the
`--bun` flag it recommended in 2024 has since been removed from those docs.

Locally the Bun runtime looks fine: `bun run verify:runtime` produces
**byte-identical** OG images and builds about 12% faster. That result is from
macOS arm64 and does not transfer to CI.

> **The blocker.** GitHub's runners are Ubuntu x86_64.
> [oven-sh/bun#20372](https://github.com/oven-sh/bun/issues/20372) — a `sharp`
> segfault under Bun, labelled `napi` / `crash` / `linux` / `runtime` — is open
> and unassigned, and its reporter notes it works on macOS arm64 and crashes on
> Linux. `sharp` is irreplaceable here: it converts satori's SVG into the OG
> PNGs, and Bun's own `Bun.Image` cannot decode SVG at all.

The trade is asymmetric — half a second on a build that runs once per deploy,
against a segfault class on the build platform with no fallback. So `build`
stays on Node. To revisit it: confirm #20372 is closed, run
`bun run verify:runtime` on an `ubuntu-latest` runner, and only then set
`build-cmd: bun --bun run build` on the action.

## Colour

Seven tokens, defined once in [`src/styles/theme.css`](src/styles/theme.css) and
registered for Tailwind in the same file. Components reference them by role
(`bg-background`, `text-muted-foreground`, `border-border`), never by value.

The neutrals sit at OKLCH hue 160–178 — a green cast rather than slate — so the
greys read as phosphor next to the accent. The dark accent is `#b6ff3d`; light
mode cannot use it (≈1.3:1 on a light ground), so it becomes the same hue at
OKLCH L50, `#4c7100`.

> Every text pair clears WCAG AA for normal text (4.5:1) against **both** the
> page background and the muted surface, because `--muted-foreground` and
> `--accent` are each used over both. Changing a lightness means re-checking two
> grounds, not one.

`--muted` is one step lighter than the palette's default stroke on purpose: the
theme uses it as a borderless fill (inline code, copy buttons, striped rows), so
it has to read as a surface on its own.

## Editing content

No copy lives in a component. Everything is a content collection validated by
Zod in [`src/content.config.ts`](src/content.config.ts); a malformed field fails
the build instead of shipping blank.

```
src/content/
├── posts/    the writing — one Markdown file per post
└── pages/    home hero, about, bookmarks
```

### Writing a post

Drop a Markdown or MDX file in `src/content/posts/`. Required frontmatter is
`title`, `description` and `pubDatetime`; `tags` defaults to `["others"]`. Add
`featured: true` to lift a post into the home page's Featured block, and
`draft: true` to keep it out of the build.

```md
---
title: "Math.floor is not a floor"
description: The obvious fix drops a step. The clever fix rounds past the input.
pubDatetime: 2026-02-26T06:00:00.000Z
tags: [correctness]
featured: true
---
```

A fenced block gains a filename caption when the fence carries a filename, and a
copy button either way.

## Structured data

Every page emits exactly one `application/ld+json` block containing a single
`@graph`. Entities are declared once with a stable `@id` and referenced by
`@id` thereafter, so the `Person` and `WebSite` are never duplicated inside a
document and a crawler reading two pages sees the same two entities. All of it
is built in [`src/utils/schema.ts`](src/utils/schema.ts); a route passes only
what is unique to itself through `Layout`'s `schema` prop.

| Route                   | Nodes                                                          |
| :---------------------- | :------------------------------------------------------------- |
| all                     | `Person` · `WebSite` · `BreadcrumbList` (except the home page) |
| `/`                     | `WebPage`                                                      |
| `/about`                | `ProfilePage`, with the `Person` as its `mainEntity`           |
| `/posts`, `/tags/<tag>` | `CollectionPage` · `ItemList` of the posts on that page        |
| `/tags`, `/archives`    | `CollectionPage`                                               |
| `/bookmarks`            | `CollectionPage` · `ItemList` of the links                     |
| `/posts/<slug>`         | `WebPage` · `BlogPosting`, authored by the `Person`            |

Breadcrumbs are derived from the canonical path, so they cannot drift from the
visible `Breadcrumb` component, and a numeric segment renders as `Page 2`
rather than as a crumb of its own.

> A dangling `@id` — a reference to a node the document never declares — is the
> failure mode worth testing for. Nothing validates it at build time.

## Search Console

`astro.config.ts` declares `PUBLIC_GOOGLE_SITE_VERIFICATION` as an optional
public env var. It is read at build time, so it has to be set where the build
runs: add it to the `env:` block of the `withastro/action` step in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), sourced from a
repository variable or secret. Leave it unset and no tag is emitted.

## Generated

| Path                      | Built by                                                 |
| :------------------------ | :------------------------------------------------------- |
| `/sitemap-index.xml`      | `@astrojs/sitemap`                                       |
| `/rss.xml`                | `src/pages/rss.xml.ts`                                   |
| `/robots.txt`             | `src/pages/robots.txt.ts`                                |
| `/og.png`                 | `src/pages/og.png.ts` — Satori, drawn with the site font |
| `/posts/<slug>/index.png` | per-post OG image, same generator                        |
| `/pagefind/*`             | Pagefind, from `dist` after the build                    |

There is no static OG image checked in: `features.dynamicOgImage` generates one
per post and a site default, so a social card can never fall out of date with
the post it belongs to.

## Licence

AstroPaper is MIT-licensed by [Sat Naing](https://github.com/satnaing); see
[`LICENSE`](LICENSE). The writing and the palette are not part of that licence.

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
| `src/content/pages/` — `home`, `about`, `bookmarks`, `projects`                         | `src/utils/` except `schema.ts`, `src/i18n/` |
| `src/content/bookmarks.yaml` — the bookmark links, as data                              | `src/layouts/` structure                     |
| `src/content/projects/` — one file per thing built                                      | everything else                              |
| `src/utils/schema.ts` — all JSON-LD                                                     |                                              |
| `src/utils/projects.ts` — project grouping and link resolution                          |                                              |
| `src/pages/projects/` — the two project routes                                          |                                              |
| `public/favicon.svg`, `public/apple-touch-icon.png`, `public/CNAME`                     |                                              |
| `.github/workflows/deploy.yml` — the Pages deploy                                       |                                              |

### Local edits against upstream

Each is marked with a comment explaining why. Keeping this list short is what
makes a theme bump a merge rather than a rewrite.

| File                                                        | Edit                                                                                                                                                                             |
| :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/index.astro`                                     | Hero copy read from the content collection; feed icon moved into the social row                                                                                                  |
| `src/components/Header.astro`, `src/i18n/`                  | Nav is `Posts · Projects · Bookmarks · About`: `Projects` and `Bookmarks` added, `Tags` dropped from the bar, `About` moved last; the list wraps instead of clipping (see below) |
| `astro.config.ts`                                           | Dark code theme; `/search/` filtered out of the sitemap                                                                                                                          |
| `src/layouts/Layout.astro`                                  | `schema` and `noindex` props; dead `favicon.ico` link removed; `og:locale`; static `theme-color`; `apple-touch-icon`; RSS href without a trailing slash                          |
| `src/layouts/PostLayout.astro`                              | Post JSON-LD routed through the shared graph instead of its own block                                                                                                            |
| `src/pages/search.astro`                                    | Dev notice only when the index is genuinely missing, naming `bun run build`                                                                                                      |
| `src/content.config.ts`                                     | `seoTitle` on pages; the `bookmarks` and `projects` collections                                                                                                                  |
| `src/components/Main.astro`, `Datetime.astro`, `Card.astro` | Optional `titleTransitionName` / `transitionName`, and the card date named, so a listing-to-detail View Transition morphs both halves (see below)                                |
| Listing and page routes                                     | Page-specific JSON-LD; the meta description the theme rendered but never set; paired View Transition names on the tag and project pages                                          |

#### Why the nav list wraps

The theme's horizontal nav overflows its own container rather than wrapping,
and when it overflows it clips from the right: the search icon cut in half, the
theme toggle off-screen entirely. That was already true at 640 px with the
theme's own four links, before this site changed anything — the excess spilled
into the right margin, which looks fine on a wide screen, so the defect only
shows once the viewport is narrow enough to reach it.

Measured in the built page, at the current four text links and three icons: the
items need 420 px of content, so the row wants 539 px. Desktop widths allocate
598 px, and 640 px allocates 470 px — it fits wide and cannot fit at the `sm`
breakpoint, which is exactly where the clipping appeared.

So the only change is `flex-wrap` plus a row gap, which degrades to a second
row instead of hiding a control and keeps the theme's own `gap-x-5` spacing.
Verified from 375 px to 1920 px: one row from 768 px up, two rows in the
640–767 px band, the hamburger below that, and no horizontal page scroll at any
width.

A nav entry costs roughly 60 px of the 598 px budget. Past it nothing breaks;
the row just wraps at a wider viewport than before.

#### View transitions

`ClientRouter` in `Layout.astro` makes navigation a client-side swap, and
`view-transition-name` morphs a listing element into its detail counterpart.
The rule that matters: **the same CSS ident must exist on the page being left
and the page being entered.** Two failure modes, both silent:

- A name on only one side animates as an exit, which reads as a flicker rather
  than a transition. `Tag.astro` shipped in exactly this state — every chip was
  named and nothing on `/tags/<tag>/` matched.
- The same name twice on one page disables the animation for that name
  entirely.

Names come from [`toTransitionName`](src/utils/toTransitionName.ts), which
sanitises to a valid CSS `<custom-ident>`: dots stripped (`Math.floor` would
otherwise be invalid), no leading digit, non-ASCII hex-encoded. An invalid name
fails the same silent way.

The pairs currently in place:

| Listing              | Detail                     | Name                      |
| :------------------- | :------------------------- | :------------------------ |
| `Card.astro` title   | post `<h1>`                | `<post-id>`               |
| `Card.astro` date    | post `Datetime`            | `<post-id>-date`          |
| `Tag.astro` chip     | `/tags/<tag>/` `<h1>`      | `<tag>`                   |
| `/projects/` heading | `/projects/<slug>/` `<h1>` | `<project-id>`            |
| `/projects/` metric  | `/projects/<slug>/` metric | `<project-id>-metric-<i>` |

A project row without a write-up links to its repository, so its heading is
deliberately left unnamed — there is no second half to morph into.

Reduced motion needs no work: Astro ships `@media (prefers-reduced-motion)`
rules that set `animation: none` on the view-transition pseudo-elements. Do not
hand-roll a second set.

Note for testing: headless Chromium exposes `document.startViewTransition` but
runs no transition, so the animation cannot be captured there. Verify the
pairing by diffing the idents per page in `dist`; the frames need a real
browser.

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

Built here, published to **`raelsei/raelsei.github.io`** by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to
`main`, as a single force-pushed commit on that repository's `master` branch —
its default branch, and the branch its Pages already serves.

**Why the output lives in another repository.** The `koray.dev` custom domain is
configured on the *user* site, `raelsei.github.io`. GitHub serves every project
site of the account under the user site's domain, so
`koray.dev/pocketbase-ts-starter/` — and nine sibling demo pages — exist only
while the domain stays there. Moving the domain onto this repository would 404
all of them, and GitHub issues no redirect for the old paths.

That constraint rules out `actions/deploy-pages`, which publishes only to its
own repository's Pages. The build is pushed as a commit instead, via
[`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages).
Publishing onto `master` rather than a `gh-pages` branch is deliberate: the
Pages source there already points at `master`, so a deploy needs no panel
setting and goes live on merge. `force_orphan` replaces that branch on every
run, so the 2019 site that used to occupy it is preserved as the
**`legacy-2019`** branch — do not delete it, it is the only copy of that
history.

**One setting is not in this repo:** `raelsei.github.io` → Settings → Deploy
keys → a **write-enabled** key, whose private half is this repository's
`PAGES_DEPLOY_KEY` secret. `GITHUB_TOKEN` cannot reach another repository, so
there is no token-only variant of this.

Because the publish is a branch commit rather than an artifact, **Jekyll does
run** unless told not to, and Jekyll skips paths beginning with `_` — which is
all of `_astro/`, every stylesheet and script on the site. Hence
[`public/.nojekyll`](public/.nojekyll). The workflow asserts both that file and
`dist/CNAME` before pushing, because either one missing is a silent outage: a
styleless site, or a domain that reverts to `raelsei.github.io`.

The build itself installs Bun and Node separately and runs the package `build`
script, so `astro check` and the Pagefind index both happen. Do not reduce it
to a bare `astro build`: search is an index generated from `dist` _after_ the
build, and `astro build` alone ships a site whose `/search` finds nothing.

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

DNS must point the apex at GitHub Pages' `A`/`AAAA` addresses, and those
records already exist — the domain has been bound to the user site since the
previous site. The zone is on Cloudflare; keep the records **DNS-only (grey
cloud)**: a proxied record blocks the HTTP validation GitHub uses to issue the
certificate, and the site then answers with a TLS error rather than a redirect,
which reads like a DNS problem and is not one.

The domain is **not verified** yet (`protected_domain_state: unverified`). Add
the `_github-pages-challenge-raelsei` TXT record Settings → Pages offers, or
the domain stays open to a takeover if Pages is ever disabled there.

> Dropping the custom domain is not a one-line change, but it is cheaper than
> it used to be: the output sits on the *user* site, so the site would fall
> back to `https://raelsei.github.io/` and `base` would stay unset. `site` in
> `astro-paper.config.ts` and `public/CNAME` must still change together, or
> every canonical URL points at a domain the site no longer answers on.

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
├── posts/      the writing — one Markdown file per post
├── projects/   one file per thing built
├── pages/      home hero, about, bookmarks, projects intro
└── bookmarks.yaml
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

### Adding a project

Drop a Markdown file in `src/content/projects/`. Required frontmatter is `name`,
`kind`, `order` and `summary`; `status`, `period`, `url`, `repo`, `lang`,
`metrics` and `tags` are optional.

```md
---
name: arcstack
kind: starter
order: 2
summary: Minimal Bun monorepo — workspaces and a version catalogue, no build orchestrator.
repo: https://github.com/raelsei/arcstack
lang: typescript
---
```

`kind` is one of `venture`, `library`, `starter`, `tool`. It only decides which
group the entry lands in on `/projects/`, in the order fixed by `KIND_GROUPS` in
[`src/utils/projects.ts`](src/utils/projects.ts); a group with no entries is not
rendered, so a kind can be named before anything fills it. `order` ranks within
the group — the index never sorts alphabetically.

**The body decides whether there is a page.** Write something under the
frontmatter and the entry gets `/projects/<slug>/`, with the index linking
there. Leave the body empty and the entry stays a row linking to `url` or
`repo`. That is deliberate: it means no page ships carrying a single sentence,
and the page cannot disagree with whether there is anything on it.

Two things are absent on purpose. There are **no per-kind tag routes** —
filtered listings with no prose of their own are near-duplicates of the index,
and at this count a filter is worse UX than one grouped page. And there are **no
star counts**: hand-authored numbers decay silently between edits, so the
repository link carries the proof instead. Both are worth revisiting past
roughly 25 projects, not before.

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

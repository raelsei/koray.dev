# koray.dev

Personal site. [AstroPaper](https://github.com/satnaing/astro-paper) v6, used as
the theme rather than forked into something else, with this site's own palette,
content and identity on top.

## What is ours and what is the theme's

Keeping this boundary clear is what makes the next theme upgrade cheap.

| Ours | The theme's |
| :--- | :--- |
| `astro-paper.config.ts` — domain, author, timezone, socials, share links, feature flags | every component under `src/components/` |
| `src/styles/theme.css` — the seven colour tokens, light and dark | `src/styles/global.css`, `typography.css` |
| `src/content/posts/` — the writing | every route under `src/pages/` |
| `src/content/pages/` — `home`, `about`, `bookmarks` | `src/utils/`, `src/i18n/`, `src/layouts/` |
| `public/favicon.svg` | everything else |

Three files carry a local edit against upstream, each marked with a comment
explaining why: `src/pages/index.astro` (hero copy read from the content
collection, feed icon moved into the social row), `src/components/Header.astro`
plus `src/i18n/` (the `Bookmarks` nav entry), and `astro.config.ts` (dark code
theme). Everything else is upstream, so a theme bump is a merge, not a rewrite.

## Commands

| Command | Action |
| :--- | :--- |
| `bun install` | Install dependencies |
| `bun dev` | Dev server on `localhost:4321` |
| `bun run build` | Type-check, build to `./dist/`, then index with Pagefind |
| `bun preview` | Serve the build locally |
| `bunx astro check` | Type-check `.astro`, `.ts`, and content schemas |
| `bun run format` | Prettier |
| `bun run lint` | ESLint |

Per `AGENTS.md`, start the dev server as `astro dev --background` and manage it
with `astro dev stop|status|logs`.

> **TypeScript stays on 6.x.** TypeScript 7's native compiler does not yet expose
> the programmatic API `astro check` relies on, so bumping it breaks both
> `astro check` and `bun run build`. Track
> [withastro/roadmap#1321](https://github.com/withastro/roadmap/discussions/1321).

## Deploying

Cloudflare Pages, connected to this repository. `koray.dev` is already a zone in
the same Cloudflare account, so the custom domain wires itself up.

| Setting | Value |
| :--- | :--- |
| Framework preset | Astro |
| Build command | `bun run build` |
| Build output directory | `dist` |
| Production branch | `main` |

`bun run build` must be the build command, not `astro build`: search is a
Pagefind index generated from `dist` after the build, and `astro build` alone
ships a site whose `/search` finds nothing.

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

## Generated

| Path | Built by |
| :--- | :--- |
| `/sitemap-index.xml` | `@astrojs/sitemap` |
| `/rss.xml` | `src/pages/rss.xml.ts` |
| `/robots.txt` | `src/pages/robots.txt.ts` |
| `/og.png` | `src/pages/og.png.ts` — Satori, drawn with the site font |
| `/posts/<slug>/index.png` | per-post OG image, same generator |
| `/pagefind/*` | Pagefind, from `dist` after the build |

There is no static OG image checked in: `features.dynamicOgImage` generates one
per post and a site default, so a social card can never fall out of date with
the post it belongs to.

## Licence

AstroPaper is MIT-licensed by [Sat Naing](https://github.com/satnaing); see
[`LICENSE`](LICENSE). The writing and the palette are not part of that licence.

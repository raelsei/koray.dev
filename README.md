# koray.dev — void terminal

Personal site. Astro, Tailwind v4, JetBrains Mono, no UI framework.

Every route is a real, statically generated page. The only client JavaScript is
a ~3 kB bundle: a clock, a reading-progress rule, copy buttons, and the command
bar at the bottom of the screen.

## Generated files

Nothing in this table is hand-maintained. Each is an endpoint under
`src/pages/`, built from the same collections the site renders, so none of them
can drift from what is actually published.

| Path                 | Built by                        | Contents                                        |
| :------------------- | :------------------------------ | :---------------------------------------------- |
| `/sitemap-index.xml` | `@astrojs/sitemap`              | Every route; `404` excluded automatically        |
| `/rss.xml`           | `src/pages/rss.xml.ts`          | Writing feed, newest first                       |
| `/robots.txt`        | `src/pages/robots.txt.ts`       | Allow-all plus absolute sitemap and llms links   |
| `/llms.txt`          | `src/pages/llms.txt.ts`         | [llmstxt.org](https://llmstxt.org) index         |
| `/llms-full.txt`     | `src/pages/llms-full.txt.ts`    | Every page, post *and dataset* inlined as Markdown |
| `/og.png`            | `public/og.png`                 | Static social card — the one asset checked in    |

`llms-full.txt` inlines the YAML collections too, not just Markdown bodies —
otherwise `/work`, `/stack` and `/library` would ship as empty headings and the
"full text" claim would be false. See `routeData()` in
[`src/lib/llms.ts`](src/lib/llms.ts).

Absolute URLs come from `site` in `astro.config.mjs`, which reads `SITE.url`.
Change the domain in one place and all five files follow.

## Commands

| Command             | Action                                            |
| :------------------ | :------------------------------------------------ |
| `bun install`       | Install dependencies                              |
| `bun dev`           | Dev server on `localhost:4321`                    |
| `bun build`         | Build to `./dist/`                                |
| `bun preview`       | Serve the build locally                           |
| `bunx astro check`  | Type-check `.astro`, `.ts`, and content schemas   |

## Editing content

**No copy lives in a component.** Everything is a content collection, validated
by Zod in [`src/content.config.ts`](src/content.config.ts). Change a file, the
site changes; the build fails loudly if a field is missing or malformed.

```
src/content/
├── pages/       one Markdown file per route — eyebrow, headline, CTA, intro prose
├── writing/     posts; frontmatter drives the header, the body drives the article
├── data/        ordered YAML lists (nav, ventures, oss, stack, rules, contacts, …)
└── shelves/     one file per /library shelf
```

Only `src/consts.ts` holds non-content configuration: domain, author, timezone,
and the status-line chrome (shell user, coordinates, availability badge). Set
`terminal.availability` to `null` to hide the availability indicator.

### Ordering

Astro's data store re-sorts every collection by `id`, so authored array order is
lost by the time `getCollection()` runs. The `ordered()` loader in
`content.config.ts` stamps each item's position in the file as `order`, and
`list()` in [`src/lib/collections.ts`](src/lib/collections.ts) sorts by it.

> Read ordered collections with `list('nav')`, never `getCollection('nav')`.

### Derived values

These are computed, never authored — so they cannot drift from the content:

| Value                        | Derived from                            |
| :--------------------------- | :-------------------------------------- |
| Reading time                 | word count of the Markdown body         |
| Archive year groups, counts  | `pubDate`                               |
| Library tab counts           | number of items on the shelf            |
| Outbound link labels         | the URL's hostname                      |
| `01` / `02` ordinals         | array position                          |
| Post section numbers         | a CSS counter on `.longform h2`            |

### Writing a post

Drop a Markdown file in `src/content/writing/`. `description` becomes the lede
and the archive-row summary. `##` headings are auto-numbered. A fenced block
gains a filename caption and a copy button when the fence carries `file=`:

````md
```ts file="money.ts" accent
type Money = { minor: bigint; currency: "TRY" | "USD" | "EUR" };
```
````

`accent` adds the lime rule down the left edge. The same chrome is produced by
[`CodeBox.astro`](src/components/ui/CodeBox.astro) for YAML-sourced code, and by
[`rehype-code-box.ts`](src/lib/rehype-code-box.ts) for Markdown — both emit
`[data-code-box]`, which is styled and wired in exactly one place.

## Design system

Every colour, size, tracking and animation is a token in
[`src/styles/global.css`](src/styles/global.css). Components compose utilities;
none of them hardcodes a hex or a pixel value that isn't layout.

```
src/components/
├── primitives/  Rule · Prompt · Cursor · Tag · Badge
├── ui/          Section · Row · Panel · Stat · Metric · CodeBox · Tree ·
│                PageHeader · Cta · Longform
└── layout/      TopBar · NavRail · Footer · CommandBar · Scanlines
```

`Row` is the workhorse: one grid row that becomes a link (with hover fill) when
given an `href`. The page owns the column template, because that is layout;
the component owns spacing, dividers and interaction, because that is chrome.

Markdown has no class attributes, so `.longform` and `[data-code-box]` are typeset
by selector in `global.css` — the one place both Markdown output and component
slots are styled.

### Invariants worth knowing before you edit

Each of these is a trap that stays silent — the build goes green and the site
ships something wrong. All four are load-bearing.

**Type-scale names must stay outside Tailwind's own scale.** `--text-sm`,
`--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl` are Tailwind
defaults. Redefining one overrides only the font-size: the paired
`--text-<name>--line-height` survives, and the utility then emits a line-height
computed from Tailwind's *original* rem size. Hence `--text-row`, `--text-item`,
`--text-entry`, `--text-venture`, `--text-flagship`, `--text-contact`.

**YAML lists use block mappings, never flow mappings.** `{ note: 4 years, still
rebuilding }` parses as `note: "4 years"` plus a null-valued key `still
rebuilding`, which Zod strips without a word. Half the sentence just disappears.

**Internal links go through [`src/lib/urls.ts`](src/lib/urls.ts).** `trailingSlash:
'always'` makes the slash-less form a hard 404 in dev, so a mistake surfaces on
the first click instead of in Search Console six weeks later.

**Ordered collections are read with `list()`, never `getCollection()`.** See
[Ordering](#ordering).

### Colour

The palette lives in the `@theme` block and nowhere else.
[`src/lib/palette.ts`](src/lib/palette.ts) parses it at build time so the Shiki
theme derives from the same source — recolouring a token reaches code blocks too.

## Structured data

Every page emits one `application/ld+json` block containing a single `@graph`.
Entities are declared once with a stable `@id` and referenced by `@id` elsewhere,
so the Person, WebSite and Organization are never duplicated within a document.

| Route | Nodes |
| :--- | :--- |
| all | `Person` · `WebSite` · `Organization` |
| `/` | `WebPage` |
| `/work`, `/library/*` | `CollectionPage` · `BreadcrumbList` |
| `/writing` | `CollectionPage` · `ItemList` · `BreadcrumbList` |
| `/writing/<slug>` | `BlogPosting` · `BreadcrumbList` |
| `/about` | `ProfilePage` · `BreadcrumbList` |

Social profiles come from `contacts.yaml`, the studio from `ventures.yaml`, word
counts and reading time from the Markdown body. Nothing is authored twice. See
[`src/lib/schema.ts`](src/lib/schema.ts).

## Accessibility

Decisions that are easy to undo by accident:

- `TopBar` renders a `<header>` and `Footer` sits *outside* `<main>` — a
  `<footer>` nested in `main` exposes no `contentinfo` landmark.
- The command bar's `<output>` is never toggled with `hidden`; a hidden element
  is out of the accessibility tree, so mutations to it are not announced.
- `.longform` lists keep their `list-style` and empty the `::marker` instead.
  `list-style: none` makes WebKit drop list semantics entirely.
- Generated content uses the `content: '…' / ''` alt-text form, so screen
  readers do not read the `##`, `>` and `-` glyphs aloud.
- `Tree` carries the hierarchy in nested `<ul role="list">`; the box-drawing
  characters are `aria-hidden` decoration.

## Command bar

Resolves against the same route table the navigation renders, so `cd work` and
clicking the tab perform the identical navigation. Aliases live in
`src/content/data/nav.yaml`.

```
help · ls · cd <section> · cat <post> · whoami · time · mail · clear
```

`⌥/` focuses the prompt from anywhere; `Esc` clears it. The bar is
`transition:persist`ed, so its log survives navigation.

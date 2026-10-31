# Working on koray.dev

The personal site of Koray Güler. Static Astro build, no server runtime.

Facts come from the `brain` repo (`identity.md`, `brand.md`, `products/`,
`accounts.md`), never from memory or an older revision of this site. Design
rules are in `DESIGN.md`, product truth in `PRODUCT.md`.

## Development

```sh
bun install
bun dev            # localhost:4321
bun run build      # astro check + astro build + Pagefind index; fetches products.json
bunx astro check   # types, components, content schemas
bun run lint       # ESLint
bun run format     # Prettier
```

Start the dev server in background mode with `astro dev --background`, and
manage it with `astro dev stop`, `astro dev status`, `astro dev logs`.

## Content

Every editorial string is a Zod-validated content collection, never a literal in
a component. Posts are `src/content/posts/`; the standing pages are
`src/content/pages/` (`home`, `now`, `off-the-keyboard`, `about`); the Log is
`src/content/log.yaml`. A malformed field fails the build rather than shipping
blank.

- **Home intro** (`home.md` → `intro`) is product-first: "I'm Koray Güler, a
  product engineer in İstanbul. I build software and ship it:", followed
  directly by the Work list. Do not lead with "founder of koative"; koative
  appears as the maker line ("Shipped under koative"), the footer ("Hire
  koative") and in the About bio.
- **Work** is fetched at build time from `PRODUCTS_JSON_URL` (default
  `https://koative.com/products.json`, the contract in `src/utils/products.ts`).
  A failed fetch or a list that does not match the contract fails the build.
  There is deliberately no committed copy: a stale product list never ships.
  For a local build before that endpoint is live, serve a file that matches
  the contract (`python3 -m http.server`) and point the variable at it.
- **Now** is dated (`updated`); bring it up to date from
  `brain/products/README.md`.
- **Log** holds only events recorded in the `## Log` sections of
  `brain/products/*.md`.
- **Profiles** live in `site.config.ts`: every account in `brain/accounts.md`
  that is ours goes into JSON-LD `sameAs` and `<link rel="me">`; `listed` ones
  are also linked on the home page with `rel="me"`.
- Products with `public: false` in the brain (Heedok, workk.me) are named,
  never described.

Reading time, the Pagefind index and the OG images are derived at build time.
Never hand-author any of them. Reading time comes from the Markdown body
(`src/utils/getReadingTime.ts`): prose at 230 words a minute, each line of code
counted like a short sentence.

Code fences take a file name and an optional bare `accent` flag after the
language, as in `ts file="money.ts" accent`. `accent` marks the block a post
turns on (the output that shows the bug, or the fix) and draws it with a light
edge.

## Honesty

The site published an invented biography once: six years in payments, koative as
an "applied-AI fintech studio", a finance-copilot Lumi with made-up metrics
(40 households, 94% categorised, 180 ms p95), a venture called `bine`, and six
open-source entries — `ledger-kit`, `sse-stream`, `tr-iban`, `prompt-forge`,
`rag-lab`, `dotfiles` — whose repositories do not exist, so every row would have
shipped as a 404. All of it was removed on 2026-09-13. Do not reintroduce any of
it, and do not derive new claims from an older revision of this file.

The rules that replace it:

- A number needs a source in the brain repo. No star counts, no usage metrics,
  no percentages that cannot be re-checked on demand.
- No clients, testimonials or case studies. The career line on `/about` is the
  brain's long bio, word for word; do not extend it.
- Lumi is not on the site. Bookmarks, Archives, Tags and Projects were removed
  on 2026-10-31; their URLs redirect (`astro.config.ts`).

## Deploying

`main` is built by `.github/workflows/deploy.yml` and force-pushed to `master` on
`raelsei/raelsei.github.io`, which is the repository the `koray.dev` domain is
attached to. Consequences, each of which has already broken once:

- Never edit `raelsei.github.io` by hand; the next deploy overwrites it. Its 2019
  site survives only on the `legacy-2019` branch.
- That repository cannot be archived. Archived repositories are read-only and
  the push would fail.
- `public/.nojekyll` must ship. A branch-published site runs through Jekyll,
  which skips `_astro/` — every stylesheet and script on the site.
- `public/CNAME` must ship, or Pages unbinds the domain.
- The workflow asserts both files before pushing. Keep that step.

## Gotchas

- **`bun run build`, never a bare `astro build`.** Pagefind indexes `dist` after
  the build; skipping it ships a site whose `/search` finds nothing.
- **Pagefind runs on the main thread (`noWorker: true`).** Pagefind 1.5
  searches in a web worker by default, and that worker fails to load this
  index ("Failed to load Pagefind metadata"), so every query came back empty
  while the same bundle works on the main thread. Do not remove the flag
  without checking a real query returns results.
- **Fonts are self-hosted files**, not a provider: Clash Grotesk and Switzer
  from Fontshare (ITF Free Font License, `src/assets/fonts/LICENSE.md`), the
  same files koative.com ships. The woff2 load through Astro's local font
  provider with `display: "block"` and are preloaded in `Layout.astro`; the
  ttf twins are read only by Satori for the OG images (`src/utils/og.ts`),
  which cannot read woff2.
- **TypeScript stays on 6.x.** TypeScript 7's native compiler does not expose
  the programmatic API `astro check` uses, so a bump breaks the type check and
  the build.
- **`trailingSlash: "always"`.** Every internal link, canonical URL and sitemap
  entry ends in a slash; the dev server rejects the slash-less form on purpose.
  Routes with a file extension are exempt, so `/rss.xml` stays slash-less.
- **Colour lives only in `src/styles/theme.css`**, one dark theme, each text
  token with its measured contrast ratio beside it. Every text token clears
  4.5:1 against both the page and the muted surface. The koative blue and
  coral are for the two dots in `Koative.astro` and nothing else.
- **Syntax colours are patched for contrast.** `vitesse-dark` ships a few token
  colours under 4.5:1. `src/utils/transformers/contrast.js` moves exactly
  those; change the Shiki theme and re-measure every token colour it emits.
- **English only.** `lang: en`, and no second locale is planned.
- **No visible breadcrumb.** The nav carries every top-level destination. The
  `BreadcrumbList` JSON-LD is still emitted for every interior page from the
  canonical path. Post pages keep their `Go back` button, which returns to the
  listing you arrived from.
- **Old URLs keep working.** `/posts/<slug>/` is permanent (the GitHub profile
  README links posts); the old `/posts/` listing, `/archives/`, `/tags/*`,
  `/bookmarks/` and `/projects/*` are redirect stubs listed in
  `astro.config.ts`. Removing a page means adding its URLs there.
- Accessibility floor to preserve: the skip link is the first focusable element
  and moves focus to `#main-content`, the focus ring is set globally so a new
  component cannot opt out by omission, and the portrait animation stops under
  `prefers-reduced-motion`.

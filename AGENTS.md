# Working on koray.dev

The personal site of Koray Güler. Static Astro build, no server runtime.

## Development

```sh
bun install
bun dev            # localhost:4321
bun run build      # astro check + astro build + Pagefind index
bunx astro check   # types, components, content schemas
bun run lint       # ESLint
bun run format     # Prettier
```

Start the dev server in background mode with `astro dev --background`, and
manage it with `astro dev stop`, `astro dev status`, `astro dev logs`.

## Content

Every editorial string is a Zod-validated content collection, never a literal in
a component. Posts are `src/content/posts/`, the four standing pages are
`src/content/pages/` (`home`, `about`, `bookmarks`, `projects`), one file per
thing built in `src/content/projects/`, and bookmarks are
`src/content/bookmarks.yaml`. A malformed field fails the build rather than
shipping blank.

Reading time, archive year groups, tag counts, the Pagefind index and the OG
images are derived at build time. Never hand-author any of them.

## Honesty

The site published an invented biography once: six years in payments, koative as
an "applied-AI fintech studio", a finance-copilot Lumi with made-up metrics
(40 households, 94% categorised, 180 ms p95), a venture called `bine`, and six
open-source entries — `ledger-kit`, `sse-stream`, `tr-iban`, `prompt-forge`,
`rag-lab`, `dotfiles` — whose repositories do not exist, so every row would have
shipped as a 404. All of it was removed on 2026-09-13. Do not reintroduce any of
it, and do not derive new claims from an older revision of this file.

The rules that replace it:

- A number needs a live source. No star counts, no usage metrics, no percentages
  that cannot be re-checked on demand.
- No employers, clients, testimonials or case studies. `/about` states no career
  timeline, because the dates have no citable source.
- koative is an independent software studio, est. 2026, shipping its own
  products first and taking a few client projects a year. Lumi is an iOS daily
  ritual app, not a finance product.

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
- **TypeScript stays on 6.x.** TypeScript 7's native compiler does not expose
  the programmatic API `astro check` uses, so a bump breaks the type check and
  the build.
- **`trailingSlash: "always"`.** Every internal link, canonical URL and sitemap
  entry ends in a slash; the dev server rejects the slash-less form on purpose.
  Routes with a file extension are exempt, so `/rss.xml` stays slash-less.
- **Colour lives only in `src/styles/theme.css`**, as seven role tokens per
  theme, each with its measured contrast ratio in a comment beside it. Every
  text token clears 4.5:1 against both the page background and the muted
  surface. Change a lightness and re-check both grounds.
- **English only.** `lang: en`, and no second locale is planned.
- Accessibility floor to preserve: the skip link is the first focusable element
  and moves focus to `#main-content`, the theme toggle is a real button with
  `aria-live="polite"`, and the focus ring is set globally so a new component
  cannot opt out by omission.

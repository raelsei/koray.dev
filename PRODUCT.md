# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: advisory leads.** Fintech teams putting an LLM somewhere near real
money, and founders who need a first engineer's judgement for a short
engagement. They arrive skeptical, usually from a post or a referral, and they
are deciding whether this person's judgement is worth an email. Success is a
qualified message to `id@koray.dev`. Capacity is finite and stated on the
site — two advisory slots, plus one partner engagement a year through koative.

**Secondary, in service of the primary:** engineers who land on a single post
from search or social. They are not the conversion target, but their trust is
the mechanism that produces one. The writing has to hold up to them or it
persuades nobody.

## Product Purpose

The personal site of Koray Güler — founder and product engineer, İstanbul.
Six years inside payments teams (reconciliation, ledgers, KYC flows), now
running koative, an applied-AI studio building fintech products in-house.

The site exists to convert demonstrated judgement into advisory work. It does
that by publishing the evidence rather than claiming it: anonymized
post-mortems of small correctness bugs that never raised an exception, the
ventures actually shipping, the open source actually maintained, and the tools
actually kept. Success is a qualified inbound; the writing is the proof, not
the product.

## Positioning

The overlap is the position: six years on payment rails *and* applied LLM work,
which is why "never let a model move money — let it draft the intent, let the
ledger decide" is a rule here rather than a slogan. A neighboring AI consultancy
cannot truthfully claim the ledger years; a payments engineer cannot truthfully
claim the eval practice.

The writing reinforces it in a way a portfolio cannot be copied into: each post
is a real bug that stayed silent — no exception, no alert, green build, wrong
number — followed by the architecture decision it forced and the point where
that decision stops working. Every post keeps a "real limits" section.

## Operating Context

**Routes.** `/` · `/posts` (paginated) · `/posts/<slug>` · `/tags` ·
`/tags/<tag>` (paginated) · `/archives` · `/projects` · `/projects/<slug>` ·
`/about` · `/bookmarks` · `/search` · `404`, plus generated `/rss.xml`,
`/robots.txt`, `/og.png`, per-post `/posts/<slug>/index.png`,
`/sitemap-index.xml`, and the Pagefind index.

**Authoring.** Editing content is editing files. `src/content/posts/` holds the
writing, `src/content/pages/` the four standing pages (`home`, `about`,
`bookmarks`, `projects`), and `src/content/projects/` one file per thing built.
A malformed field fails the build rather than shipping blank.

**Projects.** One collection, split by `kind` — `venture`, `library`,
`starter`, `tool` — because the division is authorship: a library I wrote is my
project. `kind` decides only which group it lands in on the index, and an empty
group is not rendered. A body is optional: an entry with one gets its own page,
an entry without one stays a row linking to its repository, so no page ships
carrying a single sentence. Deliberately absent: per-kind tag routes, which
would be near-duplicate listings, and star counts, which decay silently between
edits — the repository link is the evidence instead.

**Writing routine.** Posts are post-mortems with the names filed off. Each
passes four gates before publishing: factual check; privacy scrub (nothing
greppable back to a private repository, and the client's vertical must not be
inferable from the prose); editorial de-repetition; and one thesis per post,
split if it carries two.

**Rituals.** The bookmarks page holds only things that were reopened.

**Development.** `bun dev` serves `localhost:4321`; per `AGENTS.md`, start it as
`astro dev --background` and manage it with `astro dev stop|status|logs`.
`bunx astro check` type-checks components, TypeScript, and content schemas.
Deployment is GitHub Pages, published by `.github/workflows/deploy.yml` on
every push to `main` (`bun run build` → `dist`, uploaded as a Pages artifact).
The custom domain is bound by `public/CNAME`; `base` stays unset because of it.

## Capabilities and Constraints

Binding, and future work must preserve them:

- **Static only.** Every route is prerendered; there is no server runtime.
- **No editorial string lives in a component.** All copy is Zod-validated
  content collections. `astro-paper.config.ts` holds configuration only
  (domain, author, timezone, socials, feature flags). The home hero reads its
  headline and body from `src/content/pages/home.md` rather than from
  `index.astro`, which is a deliberate local edit against the theme.
- **English only.** `lang: en`. No second locale is planned. The font still
  ships the extended Latin range because the copy says "İstanbul" and
  "Türkiye".

**Superseded — the client JavaScript ceiling.** This record previously carried a
binding "~3 kB client JavaScript" constraint. Adopting AstroPaper knowingly
ended it: the shipped payload is now roughly **10 kB gzipped per page**
(≈5.7 kB for Astro's view-transition ClientRouter, ≈4.6 kB of inline behaviour
for the theme toggle, copy buttons, reading progress and menu), plus a
lazy-loaded Pagefind bundle on `/search` only. The constraint is recorded as
retired rather than deleted, so nobody re-derives it from the old site and
treats the current build as a regression. No replacement ceiling has been set.

Current implementation choices, explicitly **not** binding:

- No imagery in posts. `sharp` is now installed (the OG generator needs it), so
  adding one costs nothing but the decision.
- No UI framework island; every component is `.astro`.

Technical facts that stay true regardless:

- Search is a Pagefind index generated from `dist` *after* the build, so the
  build command must be `bun run build`. `astro build` alone ships a site whose
  `/search` finds nothing.
- **TypeScript stays on 6.x.** TypeScript 7's native compiler does not expose
  the programmatic API `astro check` relies on, so bumping it breaks both
  `astro check` and the build.
- Nothing is authored twice: reading time, archive year groups, tag counts and
  OG images are all derived from the posts at build time.
- Colour lives only in `src/styles/theme.css`, as seven role tokens per theme.
  Components reference roles, never values.
- `trailingSlash: 'always'`. Every internal link, canonical URL and sitemap
  entry ends in a slash, and the dev server rejects the slash-less form so a
  mismatch surfaces locally rather than after a deploy. Routes with a file
  extension are exempt, so `/rss.xml` stays slash-less — `/rss.xml/` is a 404
  on a real file host even though `astro preview` normalises it.

**Terminology.** *ventures* (things built, not clients) · *advisory slots* ·
*colophon* (the signed-off line closing a post).

## Brand Commitments

- **Name and identity.** `koray.dev`, titled `koray.dev`. Author Koray Güler;
  contact `id@koray.dev`; handle `raelsei` on GitHub, X, LinkedIn, and
  Telegram. Location İstanbul, `Europe/Istanbul`.
- **Voice.** Terse and lowercase-leaning. Concrete over abstract, specific
  numbers over adjectives, no launch-post enthusiasm. The stated stance:
  *"most of my writing is an argument with a younger version of myself who
  thought clever was the point."*
- **House rules**, meant to be visible in the work: money is stored in minor
  units as integers; a model may draft intent, only the ledger commits it;
  every dependency must justify its own line in the lockfile; if it cannot run
  unattended for a year, it is not finished.
- **Standing preference: the category standard, played straight.** The user
  chose [AstroPaper](https://github.com/satnaing/astro-paper) as the visual and
  structural system, used as a theme rather than forked into something else.
  Future work extends within the theme's own vocabulary and keeps the local
  edits against upstream minimal and commented, so a theme upgrade stays a
  merge. The retired *void terminal* identity is an anti-reference, not a
  fallback.
- **Palette is ours.** The seven colour tokens in `src/styles/theme.css` are
  the one part of the theme that is deliberately replaced; see `DESIGN.md`.

## Evidence on Hand

Confirmed real by the user — all of it is citable as fact:

- **Writing (published):** ten posts in `src/content/posts/`, on silent
  correctness bugs — `math-floor-is-not-a-floor`,
  `idempotent-writes-idempotent-side-effects`, `a-signing-key-in-the-browser`,
  `your-error-handler-is-inside-the-cache`, `the-page-cache-we-deleted`,
  `cache-the-prompt-not-the-inputs`,
  `llm-cannot-hallucinate-what-you-never-sent`,
  `a-missing-capability-beats-a-threshold`,
  `the-endpoint-that-succeeded-at-doing-nothing`,
  `the-label-was-not-the-identity`. The first and last are `featured: true`.
- **Ventures (published, `/projects`):** koative — applied-AI studio,
  bootstrapped, İstanbul, three engineers and one designer, funds its own
  fintech products and takes one partner engagement a year. lumi — household
  finance copilot in private beta: 40 households, 94% categorised, 180 ms p95
  sync. bine — invoice reconciliation for small merchants in Türkiye, alpha.
  Each carries a write-up, so each has its own page.
- **Open source (published, `/projects`):** ledger-kit, sse-stream, tr-iban as
  libraries; prompt-forge, rag-lab, dotfiles as tools. Rows linking to their
  repositories, no write-ups yet. The star counts the previous site carried
  (412 / 289 / 174 / 143 / 96 / 64) were **dropped on purpose**: hand-authored,
  so they decay between edits, and a link to the repository is proof where a
  stale number is a claim. Do not reintroduce them without a live source.
- **Published elsewhere on the site:** the advisory offer and the house rules
  (`/about`), and two tool links (`/bookmarks`).
- **Assets:** `public/favicon.svg` and `public/apple-touch-icon.png` (rasterised
  180×180 from the favicon) are the only binary assets; OG images are generated
  per post at build time.

**Still true, but not published.** Citable, and recoverable from git history on
`main`, where the previous implementation also lives:

- **Track record:** koative 2026—; lead product engineer on a payments platform
  2023–26; product engineer, marketplace and checkout 2021–23; freelance
  2019–21.
- **Other:** dated notes, the annual-audit stack, two dotfiles write-ups, three
  published prompts. Prompts were considered for their own section and
  **declined by the user** for now; the argument for them was long-tail search,
  the argument against was that they are undated reference material and would
  land in the RSS feed as if they were posts.
- **One contradiction to settle:** the old `stack.yaml` listed `zsh + fzf`
  while the dotfiles write-up said it had been ported off zsh to fish. The
  write-up is the more specific source, so `/projects` says fish. Confirm.

Absent, and future work must not invent them: **no testimonials, no named
clients or employers, no case studies, no press, no pricing, no logo wall, no
photography, and no product screenshots.** Employer and client names are
deliberately withheld, not missing — the posts anonymize them on purpose.

## Product Principles

1. **Proof, not claims.** Credibility is earned by publishing a real failure
   and the decision it forced. Nothing on this site asserts competence it
   cannot show.
2. **The advisory slot is the conversion path.** Every surface either builds
   the judgement case or makes the email easy. Reach that does neither is not
   a goal.
3. **Correctness is the subject.** Money is the domain where wrong is
   unambiguous; that standard applies to the site itself as much as to the
   posts.
4. **Everything earns its line.** Dependencies, kilobytes, links on the
   bookmarks page. Scarcity is the editorial position, not a limitation.
5. **The lesson is public, the client is not.** Anonymization is a permanent
   constraint on the writing, never a step to skip when a story would be
   better with names.

## Accessibility & Inclusion

No formal conformance level has been declared. The theme supplies the
accessibility floor, and these are the parts that must survive future edits:

- A skip link is the first focusable element and moves focus to `#main-content`,
  not just the scroll position.
- Contrast is a checked property, not an intention: every text token clears
  4.5:1 against both the page background and the muted surface, in both
  themes. The ratios are recorded beside the values in
  `src/styles/theme.css`.
- The theme toggle is a real `<button>` with `aria-live="polite"`, so the
  switch is announced.
- Focus is always visible: a dashed 2px accent outline, set globally rather
  than per component, so a new component cannot opt out by omission.
- The light theme exists because the dark one is a choice, not a default —
  `prefers-color-scheme` is honoured on first visit.

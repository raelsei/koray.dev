# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: client-project leads.** Teams and founders who need an iOS or
Android app, a web platform, or the product design between them, and who care
that the result stays calm. They arrive from a post, a referral, or
koative.com, and they are deciding whether this person's judgement is worth an
email. Success is a qualified message to `id@koray.dev`. Capacity is finite and
stated on the site — koative takes a few client projects a year, because its
own products come first.

**Secondary, in service of the primary:** engineers who land on a single post
from search or social. They are not the conversion target, but their trust is
the mechanism that produces one. The writing has to hold up to them or it
persuades nobody.

## Product Purpose

The personal site of Koray Güler — product engineer, İstanbul, and founder of
[koative](https://koative.com) (est. 2026), an independent software studio that
ships its own products before anyone else's. The studio's first product is
Lumi, a daily-ritual iOS app.

The site exists to convert demonstrated judgement into work. It does that by
publishing the evidence rather than claiming it: anonymized post-mortems of
small correctness bugs that never raised an exception, the products actually
shipping, and the code actually maintained. Success is a qualified inbound; the
writing is the proof, not the product.

## Positioning

The position is the whole span: one person who takes a product from typed edges
to deploy to the design decisions in between, and a studio whose stated stance
is "less software, better software" — own products first, ship less, spend the
saved time on the details people feel. A studio that only does client work
cannot claim the first part; an engineer without shipped products cannot claim
the second.

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
Deployment is GitHub Pages, but **not from this repository**: on every push to
`main`, `.github/workflows/deploy.yml` runs `bun run build` and force-pushes
`dist` as one commit to the `master` branch of `raelsei/raelsei.github.io`,
using a write-enabled deploy key held here as `PAGES_DEPLOY_KEY`. The reason is
that `koray.dev` is the custom domain of that *user* site, and GitHub serves
every project site of the account beneath it — ten demo pages, including
`koray.dev/pocketbase-ts-starter/`, exist only while the domain stays there.
`master` is the target rather than a `gh-pages` branch because the Pages source
there already points at it, so a deploy needs no panel step; the 2019 site it
replaced is kept as the `legacy-2019` branch, which is now the only copy of
that history. Two consequences are binding: `public/.nojekyll` must ship (a
branch-published site runs through Jekyll, which skips `_astro/`), and
`public/CNAME` must ship (Pages unbinds the domain without it). The workflow
asserts both before pushing. `raelsei.github.io` therefore cannot be archived —
archived repos are read-only and the push would fail. `base` stays unset
because the output lands at a domain root.

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

**Terminology.** *ventures* (things built, not clients) · *client projects*
(koative takes a few a year) · *colophon* (the signed-off line closing a post).

## Brand Commitments

- **Name and identity.** `koray.dev`, titled `koray.dev`. Author Koray Güler;
  contact `id@koray.dev`; handle `raelsei` on GitHub, X, LinkedIn, and
  Telegram. Location İstanbul, `Europe/Istanbul`.
- **Voice.** Terse and lowercase-leaning. Concrete over abstract, specific
  numbers over adjectives, no launch-post enthusiasm. The stated stance:
  *"most of my writing is an argument with a younger version of myself who
  thought clever was the point."*
- **House rules**, meant to be visible in the work: types live at the edges, so
  a mistyped field fails `tsc` rather than production; one artifact to deploy;
  every dependency must justify its own line in the lockfile; ship less, and
  spend the saved time on the details people feel.
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

Verified against live sources on 2026-09-13 — GitHub's API for
[github.com/raelsei](https://github.com/raelsei), and koative.com itself. All
of it is citable:

- **Identity.** Koray Güler, İstanbul. GitHub `raelsei` (account since October
  2018, 46 own repositories, 41 gists), X `raelsei`, blog `koray.dev`, GitHub
  `company: @koative`.
- **Studio (published, `/projects`):** koative LLC — "independent software
  studio, est. 2026", stance *"less software, better software"*. Ships its own
  products first and takes a few client projects a year; services are iOS and
  Android apps, web platforms, and product and brand design. Studio principles
  as published on koative.com/studio: calm by default, less software better
  software, own products first, craft over hype, made to last. Replies within
  48h.
- **Product (published, `/projects`):** Lumi — iOS, *coming soon*. A daily card
  drawn for the user's sky, a mood check, one line on how the day meets their
  chart, synastry between two full birth charts, and a premium Past / Present /
  Future spread each sunrise. Screens exist on koative.com/lumi; they are the
  studio's assets, not this site's.
- **Code (published, `/projects`), all three with write-ups:**
  `pocketbase-ts-starter` — strict-TypeScript PocketBase hooks and migrations,
  esbuild, multi-stage Docker, superuser IP allowlist, rate limiter, encrypted
  settings. `arcstack` — minimal Bun monorepo on built-in workspaces, Next.js
  plus Hono, shared versions pinned once in the root `catalog`, no Turborepo.
  `keel` — SaaS starter whose layering is enforced by Biome and a GritQL plugin
  rather than documented: services cannot import `hono`, handlers cannot call
  `c.json`, one `{ data } / { error }` envelope, internal `/api/*` versus
  frozen `/v1/*`, and the lint rules are themselves tested. The learning-era
  repositories (`express-typescript-starter`, `sse-react-nodejs`, `crypto-x`
  and the 2020–21 Vue/React exercises) are deliberately **not** listed: they
  are real, but they are not evidence of current judgement.
- **Writing (published):** ten posts in `src/content/posts/`, on silent
  correctness bugs — `math-floor-is-not-a-floor`,
  `idempotent-writes-idempotent-side-effects`, `a-signing-key-in-the-browser`,
  `your-error-handler-is-inside-the-cache`, `the-page-cache-we-deleted`,
  `cache-the-prompt-not-the-inputs`,
  `llm-cannot-hallucinate-what-you-never-sent`,
  `a-missing-capability-beats-a-threshold`,
  `the-endpoint-that-succeeded-at-doing-nothing`,
  `the-label-was-not-the-identity`. The first and last are `featured: true`.
- **Assets:** `public/favicon.svg` and `public/apple-touch-icon.png` (rasterised
  180×180 from the favicon) are the only binary assets; OG images are generated
  per post at build time.

**Retracted on 2026-09-13, and never to be reintroduced.** The previous
revision of this document asserted an unverifiable fintech persona as fact, and
the site published it: six years inside payments teams (reconciliation,
ledgers, KYC), koative as an "applied-AI fintech studio" with three engineers
and one designer, "two advisory slots", lumi as a household finance copilot
with invented metrics (40 households / 94% categorised / 180 ms p95 sync), a
venture called `bine`, and six open-source entries — `ledger-kit`,
`sse-stream`, `tr-iban`, `prompt-forge`, `rag-lab`, `dotfiles` — whose
repositories do not exist, so every row was a 404 waiting to ship. Also
retracted: the house rules about minor units and ledgers, and the track-record
line ("lead product engineer on a payments platform 2023–26; product engineer,
marketplace and checkout 2021–23; freelance 2019–21"), which has no source.

**Open gap.** Employment history is genuinely unknown to this document.
LinkedIn (`in/raelsei`) is behind an authwall — HTTP 999 direct, `/authwall` in
a headless browser, and the same through text proxies — so job titles, dates
and employers can only come from the user. Until they do, no page states a
career timeline. `/about` covers the path in general terms ("front end, then
the parts that decide whether a product survives") and stops there.

**Unverified but published, by the user's choice:** the contact address
`id@koray.dev`, and the `t.me/raelsei` and `linkedin.com/in/raelsei` handles.
Note the live `koray.dev` still served the 2020 site at the time of writing —
"Koray Güler | Front-end Developer", with `koray.guler@hotmail.com`,
`github.com/korayguler`, `twitter.com/koraycode`, `korayguler.medium.com` and
`linkedin.com/in/koray-guler`. Those are legacy handles; the `raelsei` set is
current.

Absent, and future work must not invent them: **no testimonials, no named
clients or employers, no case studies, no press, no pricing, no logo wall, no
photography, and no product screenshots.** A number without a live source is a
claim, not evidence.

## Product Principles

1. **Proof, not claims.** Credibility is earned by publishing a real failure
   and the decision it forced. Nothing on this site asserts competence it
   cannot show.
2. **The client project is the conversion path.** Every surface either builds
   the judgement case or makes the email easy. Reach that does neither is not
   a goal.
3. **Correctness is the subject.** A bug that never raises an exception is the
   most expensive kind; that standard applies to the site itself as much as to
   the posts.
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

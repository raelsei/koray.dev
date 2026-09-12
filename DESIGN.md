---
name: koray.dev
description: AstroPaper played straight, wearing a phosphor palette — one monospaced face, one accent, two themes derived from the same hues.
colors:
  background: "#08090a"
  foreground: "#d9dedb"
  accent: "#b6ff3d"
  accent-foreground: "#08090a"
  muted: "#29302d"
  muted-foreground: "#8f9c97"
  border: "#1e2422"
  light-background: "#f8fbfa"
  light-foreground: "#171c1a"
  light-accent: "#4c7100"
  light-accent-foreground: "#ffffff"
  light-muted: "#e7edea"
  light-muted-foreground: "#5c6662"
  light-border: "#d6dcd9"
typography:
  display:
    fontFamily: "Google Sans Code, monospace"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Google Sans Code, monospace"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Google Sans Code, monospace"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Google Sans Code, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Google Sans Code, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  none: "0"
  sm: "0.125rem"
  base: "0.25rem"
  md: "0.375rem"
  full: "9999px"
spacing:
  gutter: "1rem"
  container: "48rem"
  card-gap: "1.5rem"
  section-gap: "3rem"
components:
  card-title:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.5rem"
  nav-link-hover:
    textColor: "{colors.accent}"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
  tag-hover:
    textColor: "{colors.accent}"
  datetime:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
  code-inline:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.base}"
    padding: "0.25rem"
  copy-button:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.base}"
    padding: "0.25rem 0.5rem"
  progress-bar:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.none}"
    height: "0.25rem"
  back-to-top-mobile:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    size: "3.5rem"
---

# Design System: koray.dev

## Overview

**Creative North Star: "The Standard, Played Straight"**

This is AstroPaper used as a theme, not forked into something else. The decision
behind every open question here is the same one: do what the theme does. The
previous identity — a dark terminal emulation with a command bar and a scanline
overlay — is a deliberate anti-reference, not a fallback, and nothing from it
should be reintroduced as a flourish.

What is genuinely ours is the palette and the content. The theme's seven colour
roles were replaced with a phosphor set: near-black surfaces under a high-chroma
lime accent, on neutrals that sit at OKLCH hue 160–178 so the greys read as
green-tinted rather than slate. Light mode is derived from the same hues rather
than being a separate palette — the accent becomes the same green at OKLCH L50,
because the lime is unusable as text on a light ground. Dark is the identity;
light is the honest second state, not an afterthought.

The rest is the theme's own discipline, and that is the point. One monospaced
face at five weights does display, body and code alike. A single 48rem column,
no sidebar, no cards-with-borders. Links are accent-coloured with a dashed
underline that appears on hover. Corners are square except on interactive chrome
that the theme rounds. There is exactly one shadow in the entire system, and it
is removed above the mobile breakpoint. Motion is Astro's view transitions
morphing a post title from listing to article, plus a reading-progress rule —
orchestrated by the theme, not scattered by us.

**Key Characteristics:**
- Seven colour roles per theme, defined once, referenced by role and never by value
- Contrast verified against two grounds, with the ratios recorded beside the values
- One monospaced face (Google Sans Code, 300–700, normal and italic)
- Single 48rem column with a 1rem gutter
- Accent links with hover-revealed dashed underlines
- Square by default; radius only where the theme rounds interactive chrome
- Exactly one shadow, on the mobile back-to-top button, explicitly `md:shadow-none`
- Shared-element view transitions on post titles and tags

## Colors

Seven roles, twice: a phosphor dark set that is the identity, and a light set
derived from the same hues. The frontmatter keys map one-to-one onto the CSS
custom properties in `src/styles/theme.css`; the `light-` prefixed keys are the
`[data-theme="light"]` block.

### Primary
- **Phosphor Lime** (`#b6ff3d` dark · `#4c7100` light): the only accent. It
  carries post titles in every listing, prose links on hover, list markers, the
  reading-progress rule, the focus outline, and the selection background. In
  light mode it is the same hue at OKLCH L50 — the dark value is ≈1.3:1 on a
  light ground and would be unreadable as text.

### Neutral
- **Background** (`#08090a` dark · `#f8fbfa` light): the page.
- **Foreground** (`#d9dedb` dark · `#171c1a` light): body copy, headings,
  emphasis. 14.63:1 dark, 16.57:1 light.
- **Muted** (`#29302d` dark · `#e7edea` light): a borderless fill, used for
  inline code, the code copy button, and striped table rows. It is deliberately
  one step lighter than the border colour: the theme applies it with no stroke,
  so it has to read as a surface on its own.
- **Muted Foreground** (`#8f9c97` dark · `#5c6662` light): datetimes, archive
  counts, figure captions. Secondary text, never body text.
- **Border** (`#1e2422` dark · `#d6dcd9` light): the global default border,
  applied by `* { @apply border-border }` — section dividers, the header and
  footer rules, table cells, images, prose `hr`.
- **Accent Foreground** (`#08090a` dark · `#ffffff` light): text placed on the
  accent. Only the selection highlight uses it.

### Named Rules

**The Two-Ground Rule.** Every text token clears WCAG AA for normal text
(4.5:1) against *both* the page background and the muted surface, in both
themes, because `--muted-foreground` and `--accent` are each used over both.
The measured ratios live in a comment beside every value. Changing a lightness
means re-checking two grounds, not one.

**The One Accent Rule.** There is one accent and no second hue. A new state
that wants its own colour gets weight, case, or a border instead.

**The Derived-Light Rule.** Light mode is the dark palette's hues re-solved for
a light ground, never an independent palette. A light value that does not share
its dark sibling's hue is a bug.

**The Fill-Means-Chrome Rule.** `muted` marks machine surfaces — code, the copy
control, striped rows. It never groups editorial content into a card.

## Typography

**Display Font:** Google Sans Code (fallback `monospace`)
**Body Font:** Google Sans Code — the same face
**Label/Mono Font:** Google Sans Code — the same face

**Character:** One monospaced variable face at five weights (300, 400, 500, 600,
700) with real italics, doing display, body and code without a second family.
Hierarchy is size and weight only; there is no tracking system and no small-caps
system, which is what keeps a text-heavy page from acquiring decoration it did
not need.

### Hierarchy
- **Display** (700, `2.25rem` → `3rem` at ≥640px): the home headline, once.
- **Headline** (700, `1.5rem` → `1.875rem`): article titles, in accent.
- **Page title** (600, `1.5rem` → `1.875rem`): interior page headings from
  `Main`, in foreground, with an italic description beneath.
- **Title** (500, `1.125rem`): post titles inside listings, in accent, with a
  dashed underline on hover.
- **Body** (400, `1rem`, 1.75): prose, via `@tailwindcss/typography` with the
  `.app-prose` overrides.
- **Label** (400, `0.875rem`): datetimes, counts, pagination, captions.

### Named Rules

**The One Face Rule.** Google Sans Code is the only family. If two things must
look different, change size or weight.

**The Hover-Underline Rule.** Links are accent-coloured with
`decoration-dashed underline-offset-4`, and the underline appears on hover
rather than sitting there permanently. Focus removes the underline and takes the
global dashed outline instead, so the two states never stack into noise.

## Layout

One centred column: `app-layout` is `max-w-3xl` (48rem / 768px) with `mx-auto`
and a 1rem inline gutter, and every page uses it — header, main, footer alike.
There is no sidebar, no two-column body, and no card grid.

The header is one row: wordmark left; then Posts, Projects, Bookmarks, About as
text links, followed by the archives, search and theme controls as icon buttons.
The row wants 539px against a 598px budget, so it wraps to a second row between
640px and 767px rather than clipping a control; below 640px it collapses behind
a hamburger and the menu becomes a two-column grid. Tags is reachable from the
tag chips on a post and from the breadcrumb, not from the bar. Sections on the
home page are separated by a single
`border-border` bottom rule — hero, then Featured, then Recent Posts — with an
`All Posts` link closing the page.

Rhythm is the theme's: `my-6` between listing items, `pt-12 pb-6` around home
sections, `mt-2 mb-6` under a page title. Post listings are real `<ul>`/`<li>`
lists, not divs, so the count is announced.

Breakpoints are Tailwind's defaults; only `sm` (640px) and `md` (768px) carry
behaviour — the nav collapse and the back-to-top button's two forms.

### Named Rules

**The Single Column Rule.** 48rem, one column, everywhere. A layout that wants
two columns is a table or a list, not a new grid.

**The Borrowed-Structure Rule.** New pages are built from `Layout` + `Header` +
`Breadcrumb` + `Main` + `Footer`, in that order, with content in
`src/content/pages/`. `bookmarks.astro` is the reference implementation; copying
it is correct, inventing a parallel page shell is not.

## Elevation & Depth

This system is flat. Depth comes from the surface pair (background and muted)
and from 1px borders in a single border colour — nothing else. There is no
elevation scale, no tonal ramp, and no blur.

There is exactly one `box-shadow` in the codebase: `shadow-xl` on the
back-to-top button in its mobile pill form, which becomes `md:shadow-none` above
768px. It is a floating action button over scrolling content, which is the one
case where a shadow carries information rather than decoration.

### Named Rules

**The One Shadow Rule.** The mobile back-to-top button is the only shadow. A
second one needs a reason of the same kind — an element genuinely floating over
scrolling content — and everything else earns separation with a border.

## Shapes

Square by default. Radius appears only where the theme rounds interactive or
machine chrome, and the set is small and deliberate: `rounded` (0.25rem) on
inline code and the code-block copy button, `rounded-md` on the code filename
label, `rounded-sm` on a highlighted word, `rounded-full` on the mobile
back-to-top pill. Editorial surfaces — sections, listings, images, tables —
are square and separated by rules.

Form language is borders and dashes. A 1px border in the single border colour
divides; a 2px dashed bottom border is a tag; a dashed underline is a link on
hover; a dashed 2px outline is focus. The dash is the system's one recurring
texture, and it is the same dash everywhere.

### Named Rules

**The Square-Editorial Rule.** Content is square. Radius is reserved for
controls and code chrome, at the values above; a rounded card is the fastest way
to make this look like a different, more generic site.

**The One Dash Rule.** Dashed strokes mean "interactive or focused" — hover
underlines, tag borders, focus outlines. A decorative dashed border on something
inert breaks the signal.

## Components

Every component below is upstream AstroPaper. Three files carry a local edit,
each commented in place: `index.astro` (hero copy from the content collection,
feed icon moved into the social row), `Header.astro` plus `src/i18n/` (the
Bookmarks entry), and `astro.config.ts` (the dark code theme).

### Buttons
- **Shape:** square; `LinkButton` is a text-and-icon link, not a filled button
- **Default:** foreground text, inline-flex with a 0.25rem icon gap
- **Hover:** accent text; no fill, no movement
- **Focus:** the global dashed 2px accent outline at 1px offset
- **Disabled:** `opacity-50` and no hover, used for exhausted pagination arrows
- **Copy button** (injected into code blocks at runtime): muted fill, muted
  border, foreground text, `rounded` 0.25rem, `0.25rem 0.5rem` padding

### Chips
- **Tag:** a link with a 2px dashed bottom border in foreground, a hash icon at
  80% opacity, `1.125rem` (or `0.875rem` in `sm`). On hover the border and text
  go accent and the whole chip lifts 2px (`-mt-0.5`). No fill, ever, and no
  selected state — tags navigate, they do not filter in place.

### Cards / Containers
- **There are no cards.** A post in a listing is an `<li>` with a `my-6` margin:
  accent title at `1.125rem`/500 with a hover dashed underline, a datetime line
  beneath it, then the description as plain body copy. No border, no fill, no
  radius, no shadow. This is the system's central structural choice and the one
  most likely to be "improved" by mistake.
- **Code block:** the Shiki surface at `--shiki-dark-bg` (`#121212`, the
  `vitesse-dark` theme) or `#ffffff` (`min-light`), with a filename label above
  and a copy button top-right. The dark theme is a local edit: the theme ships
  `night-owl`, which is navy and reads as a foreign slab against this palette.

### Inputs / Fields
- **Search:** the Pagefind default UI, restyled through its own CSS variables to
  take the palette. Muted fill, foreground text, `rounded` corners.
- **Focus:** the global dashed outline; no separate focus fill.

### Navigation
- **Header links:** foreground text, `0.25rem 0.5rem` padding, accent on hover.
  The current section gets `active-nav` — a wavy 2px underline at 8px offset,
  which is the theme's own signature and is left exactly as it is.
- **Icon controls:** archives, search and theme toggle as 2rem icon buttons; the
  active one gets an underline SVG rather than a fill.
- **Mobile:** below 640px the links become a two-column grid behind a hamburger
  with `aria-expanded`, and the icon controls sit in the same grid.
- **Breadcrumb:** `Home » Section » Page` above the page title on every interior
  route, with the current segment unlinked.

### Signature Components

- **Datetime** — a calendar icon plus `D MMM, YYYY`, rendered in the site
  timezone by dayjs, in muted-foreground at `0.875rem`. Shows the modified date
  with an "Updated" label when one exists. It appears under every post title in
  every listing, which makes it the most-repeated object in the system.
- **Reading progress** — a `0.25rem` accent bar fixed at the top of an article,
  created in script rather than markup.
- **Back to top** — two forms, not two components: a `3.5rem` shadowed circle at
  the bottom of the viewport on mobile, and a flat inline text link at the end
  of the article from `md` up.
- **Shared-element transition** — post titles and tags carry
  `transition:name`, so navigating from a listing to an article morphs the title
  instead of repainting the page. This is the system's only motion with meaning,
  and it is why `ClientRouter` is worth its 5.7 kB.
- **Dynamic OG image** — generated per post by Satori at build time, drawn with
  the site font, so a social card cannot drift from the post it belongs to.

## Do's and Don'ts

### Do:
- **Do** define colour only in `src/styles/theme.css`, as the seven roles per
  theme, and reference roles (`bg-background`, `text-muted-foreground`,
  `border-border`) in components.
- **Do** re-check both grounds — background *and* muted — at 4.5:1 when adding
  or changing any text colour, and record the ratio beside the value.
- **Do** derive a new light value from its dark sibling's hue.
- **Do** build a new page from `Layout` + `Header` + `Breadcrumb` + `Main` +
  `Footer`, with its copy in `src/content/pages/`; copy `bookmarks.astro`.
- **Do** keep local edits against upstream minimal and commented, so a theme
  upgrade stays a merge.
- **Do** use the theme's existing components before writing a new one; the
  inventory above is the whole vocabulary.
- **Do** run `bun run build`, not `astro build` — search is a Pagefind index
  generated from `dist` afterwards.

### Don't:
- **Don't** wrap listing items in cards, borders, fills, or shadows. A post is
  an `<li>` with a title, a date, and a description.
- **Don't** add a second shadow, a gradient, or a blur.
- **Don't** add a second font family or a tracking system.
- **Don't** introduce a second accent hue.
- **Don't** use `muted` to group editorial content; it marks code and controls.
- **Don't** put a solid permanent underline on a link — the dash appears on
  hover, and focus replaces it with the outline.
- **Don't** reintroduce anything from the retired terminal identity: no command
  bar, no scanline overlay, no `$` prompt labels, no box-drawing glyphs, no
  bracketed `[01]` ordinals. It is an anti-reference.
- **Don't** hardcode editorial copy in a component, including the home hero —
  that is why `index.astro` reads `src/content/pages/home.md`.

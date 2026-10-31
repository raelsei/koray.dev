# Product

<!-- impeccable:product-schema 1 -->

Source of truth: the `brain` repo (`identity.md`, `brand.md`, `products/`,
`accounts.md`). This file restates what the site needs from it; when they
disagree, the brain wins.

## Platform

web

## Users

People checking who Koray Güler is: someone who saw a launch post on X,
Product Hunt or Hacker News, a developer who found one of the repos, or a
potential client of koative. They want to know who he is, what he has built,
and whether it is real, within one page.

## Product Purpose

koray.dev is the personal hub of Koray Güler, founder of koative. It answers
who, what and proof on one page, and links into the network: koative.com (the
studio), every public product site and every profile.

## Positioning

A founder who builds and launches a portfolio of products, in public. The work
is the story: what shipped, what it does, real dated events.

## Capabilities and Constraints

- Static Astro build, deployed from `main` to `raelsei/raelsei.github.io`.
- Product cards come from `https://koative.com/products.json` at build time
  (`PRODUCTS_JSON_URL`); a failed fetch fails the build.
- Old post URLs (`/posts/<slug>/`) stay live; the GitHub profile README links
  them.

## Brand Commitments

- Name `Koray Güler`; studio `koative`, lowercase; `Koative LLC` only in legal
  contexts. X is `@raelsei`; `@koative` on X is not ours.
- Plain, factual English. No slogans or metaphors.
- Visual system pinned in `brain/brand.md` → "Koray (personal)": Clash Grotesk
  and Switzer, `#08080a` / `#f2f1ee`, monochrome, B&W portrait. The only colour
  is the two koative dots (`#2f3bff`, `#ff5b45`) beside the word koative.

## Evidence on Hand

- Portrait: `src/assets/portrait/koray-dark.jpg` (from `brain/assets/portrait`).
- Products, statuses and one-liners: `brain/products/*.md` via koative.com.
- Dated events: the `## Log` sections of `brain/products/*.md`.
- No testimonials, client names, user numbers or revenue. Do not invent any.
- Products with `public: false` (Heedok, workk.me) are named only, never
  described.

## Accessibility & Inclusion

WCAG AA text contrast, keyboard focus visible everywhere, skip link first,
reduced motion respected.

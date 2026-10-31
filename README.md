# koray.dev

The personal site of Koray Güler, product engineer in İstanbul:
[koray.dev](https://koray.dev). Products are shipped under
[koative](https://koative.com).

[![deploy](https://github.com/raelsei/koray.dev/actions/workflows/deploy.yml/badge.svg)](https://github.com/raelsei/koray.dev/actions/workflows/deploy.yml)

## Content

Facts come from the `brain` repo. Posts live in `src/content/posts/`, one
Markdown file each, and keep their `/posts/<slug>/` URLs. The home page
sections (`home`, `now`, `off-the-keyboard`) and `/about` are in
`src/content/pages/`; the Log is `src/content/log.yaml`.

The Work list is not in this repo: it is fetched at build time from
`https://koative.com/products.json` (override with `PRODUCTS_JSON_URL`). If
that fetch fails, the build fails.

Reading time, the search index and the social preview images are derived at
build time. Do not hand-author any of them.

## Deploying

Push to `main`. CI builds and force-pushes the result to
[`raelsei/raelsei.github.io`](https://github.com/raelsei/raelsei.github.io),
which is where the `koray.dev` domain is attached.

Two things follow from that, and both bite quietly:

- **Never edit `raelsei.github.io` by hand.** It is generated. The next deploy
  overwrites it. The 2019 site it replaced is kept on the `legacy-2019` branch.
- **`public/.nojekyll` and `public/CNAME` must ship.** Without the first, half
  the site 404s. Without the second, the domain unbinds. The workflow refuses
  to publish if either is missing.

The rest (content rules, palette, what has already broken once) is in
[`AGENTS.md`](AGENTS.md); the visual system is in [`DESIGN.md`](DESIGN.md).

## Licence

Code: [`LICENSE`](LICENSE). The writing, the portrait and the palette are mine,
and are not part of it. Fonts: see `src/assets/fonts/LICENSE.md`.

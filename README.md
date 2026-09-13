<div align="center">

![koray.dev](.github/readme/banner.svg)

**Koray Güler**, product engineer in İstanbul, founder of
[koative](https://koative.com).

[![live](https://img.shields.io/badge/koray.dev-live-9ccc47?labelColor=08090a)](https://koray.dev)
[![deploy](https://github.com/raelsei/koray.dev/actions/workflows/deploy.yml/badge.svg)](https://github.com/raelsei/koray.dev/actions/workflows/deploy.yml)

</div>

My corner of the internet. I write about the bugs that never raise an
exception: green build, no alert, wrong answer. And I keep a list of the
things I actually shipped.

## Writing

Posts live in `src/content/posts/`, one Markdown file each. The standing pages
(`home`, `about`, `bookmarks`, `projects`) are in `src/content/pages/`, the
things I built are one file each in `src/content/projects/`, and the bookmarks
are a YAML list. No copy lives in a component, so nothing here can be edited
from two places at once.

Reading time, archive years, tag counts, the search index and the social
preview images are all derived at build time. Do not hand-author any of them.

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

The rest of it (why the output lives in another repository, the content rules,
the palette, the things that have already broken once) is in
[`AGENTS.md`](AGENTS.md).

## Licence

Code: [`LICENSE`](LICENSE). The writing and the palette are mine, and are not
part of it.

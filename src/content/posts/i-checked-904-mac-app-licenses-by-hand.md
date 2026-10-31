---
title: I checked the license of 904 Mac apps by hand
description: "Ten open-source Mac app lists gave me 1,901 repositories. Reading the actual license files, not GitHub's license field, is what decided which 904 made it into OpenMacApps."
pubDatetime: 2026-11-11T08:00:00.000Z
tags: [openmacapps, open-source, macos]
---

I wanted one place to find open-source Mac apps I could trust. The lists
already exist: awesome-mac, open-source-mac-os-apps and at least eight more.
But a list is a lead, not proof. An entry tells you someone once thought the
app was open source and ran on a Mac. It doesn't tell you what the license says
today.

So I built [OpenMacApps](https://openmacapps.com) and checked every entry
myself.

## The numbers

- 10 directories scanned, 1,901 unique repositories after removing duplicates.
- 904 apps published: 890 open source, 14 source available.
- 431 of them install with a single Homebrew command.
- 1,118 leads still waiting. Not rejected, just not reviewed yet.

## What "checked" means

An app goes in only when I can point to all four:

1. The repository actually contains the app's source, not just a download page.
2. A license file I read, linked, with the date I read it.
3. An official download or release that runs on macOS.
4. A description written for the catalogue, not copied from a list.

No license file means no entry. A public repository is not an open-source
license, and neither is "free".

## GitHub's license field is a hint

The first thing I tried was the license field GitHub's API returns. It gets the
easy cases right and gives up on the interesting ones. Rectangle, Sequel Ace,
CotEditor and HandBrake all come back as `NOASSERTION`.

Open the files and they're MIT, MIT, Apache-2.0 and GPLv2. They carry extra
notices: inherited copyright lines, separately licensed images, bundled
components. That's enough to confuse the detector, and not enough to change
what the code is licensed under.

A catalogue that trusted the API would either drop four of the best Mac apps or
guess. I read the file.

## Open source that isn't quite

The opposite problem is harder to spot. Some well-loved apps publish their
source under terms that restrict how you can use it:

- **Pearcleaner:** Apache-2.0 plus the Commons Clause, which forbids selling it.
- **Mos:** CC BY-NC 4.0, non-commercial use only.
- **GitButler:** FSL-1.1, restricted for two years before each release turns
  into MIT.
- **Mac Mouse Fix:** its own license, with conditions on redistribution and
  monetization.

These are good apps, and leaving them out would make the catalogue worse. So
they're in, with a **Source available** label, a note on what the restriction
is, and a filter that hides them. They're never counted as open source.

## How it's built

Every app is a folder in a [public repository](https://github.com/koative/openmacapps):
one Markdown file with the metadata and the license evidence, plus the icon and
screenshots, each with a record of where the image came from. The site is
static, built with Astro and Bun, served from GitHub Pages. No ads, no
accounts, no backend.

Download buttons always go to the developer's own release or website. I don't
host installers.

## What's next

I'm working through the 1,118 leads. If your app belongs in the catalogue, open
a pull request with a link to its license. If an entry is wrong, open an issue
and I'll fix it.

[openmacapps.com](https://openmacapps.com)

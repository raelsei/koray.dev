---
name: koray.dev
description: Personal hub of Koray Güler. Monochrome koative base, B&W portrait, the two koative dots as the only colour.
colors:
  void: "#08080a"
  light: "#f2f1ee"
  soft: "#a9a9b0"
  muted-foreground: "#8a8a91"
  muted: "#141417"
  border: "#26262b"
  koative-blue: "#2f3bff"
  koative-coral: "#ff5b45"
typography:
  display:
    fontFamily: "Clash Grotesk, sans-serif"
    fontSize: "clamp(2.25rem, 4.6vw, 4.75rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  section-title:
    fontFamily: "Clash Grotesk, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
  row-title:
    fontFamily: "Clash Grotesk, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.875rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Switzer, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  meta:
    fontFamily: "Switzer, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  icon: "22%"
  code: "12px"
  pill: "999px"
spacing:
  frame-x: "48px"
  section: "160px"
  section-mobile: "112px"
  row: "24px"
components:
  status-badge:
    textColor: "{colors.soft}"
    rounded: "{rounded.pill}"
    padding: "0.2em 0.75em"
  ledger-row-hover:
    backgroundColor: "{colors.muted}"
---

## Overview

A founder homepage set like a contact sheet: one black-and-white portrait, one
plain sentence, then ledgers of real things (products, dates, links). The
ground is the koative void; everything is light on dark, in greys. The only
colour anywhere is the pair of koative dots, blue then coral, in front of the
word koative. One theme only; there is no light mode.

## Colors

- `void` is the page. `light` is primary text and every interactive state
  (links, focus ring, selection), never a hue.
- `soft` is secondary prose; `muted-foreground` is dates, meta and labels. Both
  clear 4.5:1 on `void` and on `muted`.
- `muted` is the only surface (inline code, row hover, icon tiles); `border` is
  the hairline between ledger rows.
- `koative-blue` and `koative-coral` are reserved for the two dots
  (`src/components/Koative.astro`). Product icons render in greyscale and take
  their own colour only on hover or focus.

## Typography

Clash Grotesk (500/600) for anything that is a name or a heading; Switzer
(400/500/600) for reading. Display text is set tight (-0.03em) and balanced.
Dates use tabular figures. Code uses the system monospace stack; mono is never
used as decoration.

## Layout

Two frames: the wide frame (`app-frame`, max 80rem) for header, footer and the
home page, and the reading column (`max-w-app`, 42rem) for posts, About,
Writing and Search. Home sections are a two-column grid from 768px: a 3fr
heading column and a 9fr body column. On desktop the portrait bleeds off the
right edge behind the intro and dissolves into the void through edge masks; on
mobile it sits above the sentence and fades at the bottom.

## Elevation & Depth

Flat. Depth comes only from the portrait's tonal range and its masked edges.
No shadows, no glass.

## Shapes

Hairline rules separate rows. Radii: 22% on product icon tiles (app-icon
shape), 12px on code blocks, full pills on status badges. Everything else is
square.

## Components

- **Ledger row** (Work, Log, Now, Writing): top/bottom hairlines, the whole row
  is the link target, secondary links (Source) sit above it. Hover fills with
  `muted`.
- **Status badge:** pill outline; Live has a filled light dot, Beta a hollow
  ring, Coming soon no dot.
- **koative mark:** two 0.4em dots, blue then coral, then the lowercase word.
- **Hire koative close:** display-size line at the end of every page.
- **Motion:** one moment. The portrait develops on load (blur and exposure
  settle over 2.2s, expo ease-out); off under reduced motion. Other motion is
  colour and underline transitions only.

## Do's and Don'ts

- Do keep copy plain and factual; let the product list carry the page.
- Do keep every colour except the two dots out of the UI.
- Don't add a light theme, gradients, glow, or a second accent.
- Don't put a label or eyebrow above a heading; the heading column carries it.
- Don't describe products marked `public: false` beyond their name.

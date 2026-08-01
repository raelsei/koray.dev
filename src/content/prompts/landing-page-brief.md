---
title: Landing page brief
description: >-
  Generates a one-page landing brief in a style the model was forced to pick
  against its own instincts. Models converge on the same three aesthetics, so
  the first step disqualifies whatever it reaches for.
order: 1
tags: [design, generation]
---

## Role

You write a prompt. You do not write the landing page.

## Step 1 — choose a style, adversarially

Language models converge. Left alone you will reach for the same three styles
every run, so remove them before you choose.

1. Name the three styles below you feel most drawn to right now. Those three
   are disqualified.
2. **Neobrutalist is disqualified in every run**, named or not. It is the
   default failure mode of this task, not a decision.
3. If the user supplied a seed word, count its letters and index into the
   surviving list with `letters mod list length`. With no seed, take the
   surviving style furthest from the work you would normally produce.

State the result as one line. Never discuss the selection again.

### Style pool

Extend it if you know a style that fits better.

| Family | Styles |
| :--- | :--- |
| System | Swiss/International · Bauhaus · Modernist · Neo-Geo · Flat · Material |
| Restraint | Minimal · Luxury Minimal · Monochromatic · Japandi · Scandinavian |
| Surface | Glassmorphism · Neumorphic · Gradient Modern · Dark Mode First |
| Voice | Editorial · Typography First · Art Deco · Retro-futuristic · Metropolitan |
| Motion | Kinetic · Organic/Fluid |
| Posture | Corporate Professional · Tech Forward · Neobrutalist |

Styles may be combined when the pairing has a reason. State the reason in one
clause, or do not combine them.

## Step 2 — invent what is being sold

Invent a business or service the chosen style genuinely suits: something with a
reason to exist, not a placeholder to hang a hero image on. One page is the
entire product surface. There is no second page to explain it later.

## Step 3 — write the prompt

Exactly three paragraphs of prose. No headings, no lists, no code fences.
150–220 words each.

- **Paragraph one.** Name the style and the concept. Describe the mood on
  arrival — the first two seconds, before a word is read. Then how the page
  should feel under the scroll: where it tightens, where it breathes, where it
  lands. Colour is required; say what it is doing emotionally, not which hex it
  is.
- **Paragraph two.** Design philosophy as sensation. How the type should feel —
  authoritative, welcoming, clinical, warm. What motion should feel like —
  liquid, snapped, weighted, inevitable. Then the emotional arc: the shift from
  first impression to final call to action, and what has to change in the
  visitor for that ending to feel earned rather than merely requested.
- **Paragraph three.** Abstract reference only. Kinds of rooms, qualities of
  light, materials, craft traditions, artistic periods, architectural
  attitudes, cultural moments. For each, say what quality it contributes and
  how that quality should surface in restraint, rhythm, density or finish.

## Constraints

- One page, one scroll. No routes, tabs, modals or multi-step flows.
- Feeling, not implementation. No frameworks, no pixel values, no
  section-by-section wireframe, no copy deck.
- Name no company, product, studio, platform or live site. Keep every reference
  abstract enough to leave the interpretation open.
- Write it as a brief. No hedging, no "consider", no "perhaps".

## Output

```text
Style: <chosen style>

<paragraph one>

<paragraph two>

<paragraph three>
```

Nothing before, nothing after. No preamble, no commentary on your own
selection, no closing summary.

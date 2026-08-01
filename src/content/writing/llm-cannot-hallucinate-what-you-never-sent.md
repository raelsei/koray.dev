---
title: Your LLM can't hallucinate a number it was never given
description: >-
  Anti-hallucination is usually written as a prompt rule. It is better written as
  a string-assembly rule, and the sharpest one is: never send an empty field.
pubDate: 2026-07-18
tags: [llm, prompts, architecture]
colophon: written in İstanbul, july 2026 — EOF
---

## two halves that must not blur

The system pairs an exact computation engine with a language model. The engine
owns every quantity. The model owns only phrasing. Users read the prose as
authoritative, which means an invented number is not a glitch — it is the
product lying fluently, in a sentence indistinguishable from a true one.

The engine's output is also conditionally available. Some values only exist when
the user supplied a precise enough input, and about half of them don't. So the
prompt is assembled from a partially populated fact set on every single request.
That is the actual problem. Not "will the model make things up" but "what
happens to the slot where a fact should have been".

## the model never sees a number

First rule: the model receives no raw values it could do arithmetic on. The
engine computes at full precision, rounds, maps the result to its categorical
bucket, and translates that bucket into the user's language — all *before*
assembly. What lands in the prompt is a finished phrase with the tolerance
already baked in, never an underlying coordinate.

Localisation happens on the way in for the same reason. Ask a model to translate
a proper noun and it will, plausibly, wrongly, once in fifty.

## omit the line, don't blank it

This is the whole post.

```typescript file="assemble.ts" accent
const facts = [
  `baseline: ${renderBaseline(reading)}`,
  signals.length ? `signals: ${top(signals, 3).map(render).join('; ')}` : null,
  window ? `window: ${renderWindow(window)}` : null,
]
  .filter(Boolean)
  .join('\n');
```

There is no `signals: none`. No `window: unknown`. No null placeholder, no
empty string, no `N/A`. A missing fact produces a missing *line*.

The difference is not cosmetic. A blank field is an invitation — the model reads
a labelled slot with nothing in it and fills it, because that is what the shape
of the text asks for. An absent field asks for nothing. You have not instructed
the model to behave; you have removed the thing it would have responded to.

Pair it with one prose rule that says what to do with the gap rather than what
not to do with it: *when a signal is given, that signal is the headline; if one
is not provided, read at the coarse level and never invent one.* The system then
degrades to vaguer-but-true instead of specific-and-false.

> The model's factual ceiling is set by what you physically put in the string.
> The prompt text is a hint. The assembly is the enforcement.

Caps belong here too. The engine can produce dozens of ranked relations; the
prompt takes the tightest three. Not for tokens — to stop the model padding a
thin reading by enumerating everything it was handed.

## the model doesn't get to write names either

The escalation, on the conversational surface: when the model needs to reference
a catalog entity, it may not write the name. It must emit an opaque marker in
place of it, drawn from an id allowlist injected into the prompt.

```text file="reply.txt"
That pattern points at [[item:47]] more than anything else this week.
```

The client renders the localised name from the id. This deletes a bug class
rather than defending against it: the model can no longer misname, mistranslate,
or invent an entity. The worst available failure is an unrenderable marker, which
is loud and cosmetic instead of quiet and wrong.

An earlier version had markers *alongside* the name. That version could still be
wrong — it just also carried the correct id next to the incorrect word. Replacing
the name was the fix; a parallel marker type that had no allowlist was deleted
rather than repaired.

## how do you regression-test a prompt

Conditional assembly means "the prompt" is a family of prompts. You cannot read
one and conclude the system is correct. So the assembled prompts are snapshotted
across every supported language, with the test file stating that a diff is a
*product* change and must never be auto-accepted.

The one that earns its keep is the negative test: feed it degraded input and
assert the enrichment lines are **absent**, not empty. That is the omit-don't-blank
rule in machine-checkable form, and it is the only thing standing between you and
a future refactor that helpfully adds a fallback string.

## what this doesn't buy you

Nothing here constrains interpretation. The model can still draw a wrong reading
from a set of entirely correct facts, and no amount of assembly discipline
touches that.

The caps can also truncate something genuinely significant if the sort key is
wrong — the ranking is now load-bearing in a way that is easy to forget. And the
marker indirection introduces a rendering contract between prompt and client; let
those drift and users see raw markers.

What it does buy is a clean line of responsibility. When a number is wrong, it is
the engine's fault, and there is exactly one place to look.

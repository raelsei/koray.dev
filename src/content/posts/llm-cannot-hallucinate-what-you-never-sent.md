---
title: "Your LLM can't hallucinate a number it was never given"
description: Anti-hallucination gets written as a prompt rule. It belongs in the code that builds the prompt, and the sharpest version of it is one line long.
pubDatetime: 2026-07-18T06:00:00.000Z
tags: [llm]
---

## two halves that must not blur

The system pairs an exact computation engine with a language model. The engine
owns every quantity. The model owns only phrasing. Users read the prose as
authoritative, so an invented number is not a glitch — it is the product lying
fluently, in a sentence indistinguishable from a true one.

The engine's output is also conditionally available: some values only exist if
the user completed an optional part of setup, and about half haven't. So the
prompt is assembled from a partially populated fact set on every request. That
is the real problem. Not "will the model make things up" but "what happens to
the slot where a fact should have been".

## the model never sees a number

The model receives nothing it could do arithmetic on. The engine computes at full
precision, rounds, maps the result into a named band, and translates that band
into the user's language before assembly. What lands in the prompt is a finished
phrase; the underlying figure never appears.

Translation happens on the way in for the same reason. Ask a model to render a
proper noun in another language and it will oblige, plausibly and wrongly, often
enough to matter.

## omit the line, don't blank it

This is the rule.

```typescript file="assemble.ts" accent
const lines = [
  `baseline: ${renderBaseline(input)}`,
  signals.length ? `signals: ${rank(signals).slice(0, 3).map(render).join('; ')}` : null,
  phase ? `phase: ${renderPhase(phase)}` : null,
];

const facts = lines.filter((l): l is string => l !== null).join('\n');
```

There is no `signals: none`. No `phase: unknown`. No null placeholder, no empty
string, no `N/A`. A missing fact produces a missing *line*.

A blank field is an invitation. The model reads a labelled slot with nothing in
it and fills it, because that is what the shape of the text asks for. An absent
field asks for nothing.

Pair it with a prose rule that says what to do with the gap: *when a signal is
given, that signal is the headline; if none is given, stay at the coarse level
and invent nothing.* The system then degrades to vaguer-but-true instead of
specific-and-false.

> The model's factual ceiling is what you physically put in the string. The
> prompt text is a hint. The assembly is the enforcement.

Caps belong here too. The engine can rank dozens of derived items; the prompt
takes the top three. Not to save tokens — to stop the model padding a thin
answer by enumerating everything it was handed.

## the model doesn't get to write names either

The escalation, on the conversational surface: when the model needs to reference
an internal record, it may not write the name. It emits an opaque reference
drawn from an id set injected for that request.

```text file="reply.txt"
That pattern points at <<ref 47>> more than anything else this week.
```

The client resolves the reference to a localised name. This deletes a bug class.
The model can no longer misname or invent a record, and the worst available
failure is an unresolvable reference — loud and cosmetic instead of quiet and
wrong.

That last claim only holds if the client enforces the same set. An allowlist
injected into the prompt is a prompt-side constraint, which is precisely the kind
of guarantee the rest of this post refuses to trust. The render-side check is the
one that makes it true: resolve **only** against the ids sent for this request,
and reject anything else. Look the id up in the full catalog instead and a
fabricated reference renders a real, wrong name — the exact failure the design
claims to have removed.

An earlier version emitted the reference next to the name. That version could
still be wrong; it just carried the right id beside the wrong word.

## how do you regression-test a prompt

Conditional assembly means "the prompt" is a family of prompts. You cannot read
one and conclude the system is correct. So the assembled prompts are snapshotted
across every supported language, with the test file stating that a diff is a
product change and must never be auto-accepted.

The one that earns its keep is the negative test: feed it degraded input and
assert the enrichment lines are **absent**, not empty. That is the rule in
machine-checkable form, and it is the only thing standing between you and a
future refactor that helpfully adds a fallback string.

## what this doesn't buy you

Nothing here constrains interpretation. The model can still draw a wrong reading
from a set of entirely correct facts, and no amount of assembly discipline
touches that.

The caps can truncate something significant if the ranking is wrong, which makes
the sort key load-bearing in a way that is easy to forget. And the reference
indirection introduces a contract between prompt and client; let those drift and
users see raw markers.

What it does buy is a clean line of responsibility. When a number is wrong, it is
the engine's fault, and there is exactly one place to look.

_written in İstanbul, july 2026 — EOF_

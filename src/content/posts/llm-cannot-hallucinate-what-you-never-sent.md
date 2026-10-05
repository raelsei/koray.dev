---
title: "Your LLM can't hallucinate a number it was never given"
description: "Preventing invented facts in the code that builds the prompt rather than in its instructions: no raw numbers, no empty fields, and opaque references instead of names."
pubDatetime: 2026-07-18T06:00:00.000Z
tags: [llm]
featured: true
---

The system pairs a deterministic engine with a language model. The engine
computes every quantity; the model only writes the prose. Users read that prose
as authoritative, so an invented number is not a small glitch. It is the product
stating something false in a sentence that looks exactly like a true one.

Some of the engine's output depends on an optional setup step that about half of
users skip. So every prompt is built from a partly filled set of facts. The real
question is not whether the model will make things up, but what happens in the
place where a missing fact would have gone.

## The model never sees a number

The prompt contains nothing the model could do arithmetic on. The engine
computes at full precision, rounds, maps the result to a named range, and
translates that into the user's language before the prompt is built. What
reaches the model is a finished phrase.

Translation happens before the prompt for the same reason. Ask a model to
translate a proper noun and it will, plausibly and sometimes wrongly.

## Leave the line out, not blank

```typescript file="assemble.ts" accent
const lines = [
  `baseline: ${renderBaseline(input)}`,
  signals.length
    ? `signals: ${rank(signals).slice(0, 3).map(render).join("; ")}`
    : null,
  phase ? `phase: ${renderPhase(phase)}` : null,
];

const facts = lines.filter((l): l is string => l !== null).join("\n");
```

There is no `signals: none`, no `phase: unknown`, no empty string, no `N/A`. A
missing fact means a missing line.

A labelled field with nothing in it invites the model to fill it, because that
is what the shape of the text asks for. A field that is not there asks for
nothing.

The instructions cover the gap: if a signal is given, lead with it; if not, stay
general and invent nothing. The output degrades to vaguer but true instead of
specific and false. The instructions are a hint. What you put in the string is
the actual limit.

The top-three cap belongs here too. The engine can rank dozens of items; the
prompt gets three. That is not about tokens. It stops the model padding a thin
answer by listing everything it was given.

## The model does not write names either

In the chat feature, when the model refers to an internal record, it cannot
write the record's name. It writes an opaque reference from a set of ids
injected for that request:

```text file="reply.txt"
That pattern points at <<ref 47>> more than anything else this week.
```

The client resolves the reference to a localised name. The model can no longer
misname or invent a record. The worst case is a reference that does not resolve,
which is visible and harmless instead of quiet and wrong.

That only holds if the client enforces the same set. An allowlist in the prompt
is a prompt-side constraint, which is exactly what this post argues against
trusting. The client must resolve only against the ids sent for this request and
reject anything else. If it looks ids up in the full catalogue instead, an
invented reference renders a real but wrong name, the very failure this was
meant to remove.

An earlier version had the model write the name next to the reference. It could
still be wrong; it just put the right id beside the wrong word.

## Testing a prompt

Because lines are added conditionally, "the prompt" is really a family of
prompts, and reading one tells you little. So the built prompts are
snapshot-tested in every supported language, and the test file says a diff is a
product change that must never be auto-accepted.

The most useful test is the negative one: give it incomplete input and assert
that the optional lines are absent, not empty. That is the rule in a form a
machine can check, and it is what stops a future refactor from adding a helpful
fallback string.

## What this does not cover

None of this controls interpretation. The model can still draw a wrong
conclusion from correct facts.

The cap can drop something important if the ranking is wrong, so the sort order
matters more than it looks. And the reference scheme creates a contract between
the prompt and the client; if the two drift apart, users see raw markers.

What it does give is a clear line of responsibility. If a number is wrong, the
engine is at fault, and there is one place to look.

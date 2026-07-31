---
title: Evals before prompts
description: >-
  For a year I wrote prompts the way I once wrote code without tests: carefully,
  confidently, and with no way of knowing when I broke something. Writing the
  eval first fixed that, and it cost less than an afternoon.
pubDate: 2026-06-12
tags: [evals, llm, process]
colophon: written in İstanbul, june 2026 — EOF
---

## the wrong order

The first version of our transaction categoriser was a very good prompt. I know
it was good because I read it many times and felt pleased. It went to
production, and for three weeks it was fine. Then a user connected an account
full of shared household expenses, and the model started confidently filing a
mortgage payment as dining.

I did what you do: added a sentence to the prompt. The mortgage got fixed. Two
weeks later, refunds broke — a case that had worked since day one. I had no idea
when it broke, or which edit did it, because nothing in my process could tell the
difference between an improvement and a trade.

That is not a prompting problem. That is the absence of a test suite, wearing a
machine-learning costume.

## an eval is a spec you can run

The reframe that helped me: an eval set is not a benchmark, it is a
specification with a pass/fail attached. Every case is a sentence a product
manager could have written — "a mortgage payment must never be categorised as
discretionary spending" — expressed in a form a machine can check.

Which means you can write them before the feature exists. You do not need a
model, a prompt, or an API key to know what correct looks like. You need to have
decided.

> A prompt is a guess. An eval is the thing that tells you whether the guess was
> any good — and, more usefully, when it stopped being good.

## the ten-second rule

My only real rule for writing them: if a human reviewer cannot grade the output
in under ten seconds, the eval is wrong. Not the model — the eval. Vague criteria
like "is the summary helpful?" produce vague scores that nobody trusts and
everybody quietly ignores.

So the cases get narrow on purpose. Does the output contain the correct category,
from a fixed list? Does it refuse when the statement is unreadable? Does it ask a
clarifying question when two categories are genuinely plausible? Each of those is
judged in a glance, which means the suite can be graded by a person on a bad
morning — and that is the property that makes it survive.

## what it looks like in practice

Twelve cases, written before the prompt: four happy paths, four adversarial, two
genuinely ambiguous, two the model must refuse. JSONL, in the repo, next to the
unit tests, run in CI.

```jsonl file="cases.jsonl" accent
{"id":"happy-01","in":"MIGROS MMM 214,90 TRY","want":"groceries"}
{"id":"adv-01","in":"KREDI ODEME 12.400,00 TRY","want":"housing","must_not":["dining","shopping"]}
{"id":"adv-02","in":"IADE MIGROS -214,90 TRY","want":"refund"}
{"id":"amb-01","in":"STARBUCKS 1.240,00 TRY","want":"ask","why":"gift card or coffee"}
{"id":"refuse-01","in":"###...unreadable...###","want":"refuse"}
```

## what changed

Two things, and only one of them is about quality. The obvious one: the suite
catches regressions, so a prompt edit is now a normal change with a normal
signal, not a coin flip.

The one I did not expect is that it made me braver. I rewrote that categoriser
prompt nine times in a month — deleted two thirds of it, dropped the examples I
was sentimentally attached to, switched models twice — because every rewrite took
ninety seconds to judge. Without the suite I would have kept the mediocre version
out of fear. Tests do not slow you down; they are what lets you throw work away.

The habit now: write the twelve cases, watch them all fail, then write the
smallest prompt that makes them pass. It is the same loop I have trusted for a
decade. It just took me a year to notice it applied here too.

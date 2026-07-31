---
title: The token budget of a checkout flow
description: >-
  What an LLM actually costs when it sits on the critical path of a payment —
  measured in milliseconds and in incidents, not in cents per million tokens.
pubDate: 2026-04-21
tags: [llm, payments, latency]
colophon: written in İstanbul, april 2026 — EOF
---

## the cheap part is the money

The first number everyone quotes is the wrong one. Model pricing is the smallest
line in the budget of an LLM feature that touches checkout. We ran ours for a
quarter: inference was roughly nine percent of the total cost of the feature. The
rest was latency, retries, and the engineering time spent making failure boring.

## latency is a conversion problem

A checkout step has a budget measured in hundreds of milliseconds, and a model
call is the slowest thing you can put in it. We started with a synchronous call
in the confirm handler and watched p95 go from 240ms to 1.9s. Conversion moved
before anybody filed a bug.

Three changes fixed it, in order of how much they mattered:

- Move the call off the critical path. Classify the cart while the user is still
  typing their address, not when they press pay.
- Cache the plan, not the answer. The same basket shape recurs constantly; the
  decision structure is stable even when the totals are not.
- Set a hard deadline and mean it. 400ms, then fall back to the deterministic
  path. A slightly worse decision now beats a better one after the user left.

> If your fallback path is not exercised in production every day, it is not a
> fallback. It is an untested branch waiting for your worst traffic day.

## the budget that actually binds

Context, not cash. Every token you spend on prose is a token not spent on
examples, and examples are what move accuracy. We cut our system prompt by two
thirds, added six worked examples, and the eval suite went up four points while
the bill went down.

```typescript file="deadline.ts"
const decide = async (cart: Cart): Promise<Decision> => {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 400);
  try {
    return await classify(cart, { signal: ac.signal });
  } catch {
    return rulesEngine(cart); // deterministic, ~2ms, always available
  } finally {
    clearTimeout(timer);
  }
};
```

## what I would tell myself

Put the model next to the payment, never inside it. Let it draft, annotate,
enrich and explain — and let a deterministic path own the moment money moves. The
model gets to be useful; the ledger gets to be right. Nobody gets paged.

---
title: A missing capability beats a threshold
description: >-
  A limit can be misconfigured, and mine throttled the one thing that was
  supposed to recover from the problem it was throttling.
pubDate: 2026-04-04
tags: [cost]
colophon: written in İstanbul, april 2026 — EOF
---

## the expensive call on the cheapest path

Per-user generated content is slow, quota-bound and fails more often than the
rest of the system. The naive placement is lazy: generate on first request, cache
the result, move on.

That puts the call on the app's launch path, which is also the spikiest path
there is. Everyone opens the app in the same two hours; the quota exhausts
exactly when the largest number of people are looking at it. The failure is
correlated with attention by construction.

## the throttle I deleted

First fix was a per-process throttle. It was wrong twice.

It was per-*instance*, so it bounded nothing horizontally — two containers meant
two budgets, and the number it enforced was a number nobody had chosen. And it
sat in front of the scheduled retry as well, which was the mechanism supposed to
refill the cache once quota recovered. The throttle's job was to protect the
quota; its effect was to prevent recovery from quota exhaustion.

What replaced it is not a limit at all:

```typescript file="generate.ts" accent
// The request path does not hold this capability. Only the scheduler passes true.
export async function getOrGenerate(userId: string, mayGenerate: boolean) {
  const hit = await readCached(userId);
  if (hit) return hit;

  if (!mayGenerate) return fallback();        // precomputed, always available
  ...
}
```

The scheduler passes `true`. Every request handler passes `false`. A normal app
open cannot trigger the call, because the code path lacks the ability rather than
being rate-limited out of using it.

> A threshold is a number someone has to get right. A missing capability is not
> a number.

## two details that make it hold

Generation failures return the fallback and are **not cached**. This is the part
that is easy to get backwards: caching a failure means the next scheduled run
finds a hit and skips the work, and the fallback becomes permanent for that user
until something evicts it. Leaving the miss in place is what makes the next run
self-healing.

Each user is keyed on their own local day, which makes the scheduler naturally
idempotent. Re-running it — after a deploy, after a crash, after someone runs it
by hand to check something — only spends on users who have actually rolled into
a new day. That property is what lets you re-run it without thinking, and being
able to re-run a batch job without thinking is most of its operational value.

## when this stops working

The cost model inverts. Warming everyone every day scales with the size of the
user table, not with who opened the app — so you now pay for dormant accounts.
For a product whose core surface is regenerated on a fixed cadence and is the
reason people open it, that is the right trade. For one where most registrations
never come back, it is upside down, and a lazy path with a real limiter is
correct after all.

Users the scheduler hasn't reached yet — new signups, someone in a timezone that
rolled over between runs — always see the fallback. Which means the fallback is
not an error state, it is a product surface, and it deserves the same attention
as the generated version. Mine did not get that for the first two months.

There is also a smaller thing I got wrong on the way. The spend counter is
incremented before the call and refunded if it fails, and the refund has to cover
the metering step itself throwing. That sounds paranoid right up until the first
user loses a credit to an error that never reached the model.

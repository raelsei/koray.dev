---
title: Keep the model call off the request path
description: "A per-instance throttle limited nothing and blocked the job meant to recover from quota exhaustion. Removing the request path's ability to generate fixed both."
pubDatetime: 2026-04-04T06:00:00.000Z
tags: [llm, cost]
---

Each user gets content generated for them once a day. The model call is slow,
has a quota, and fails more often than anything else in the system.

The easy design is lazy: generate on the first request of the day and cache the
result. That puts the call on app launch, which is also the busiest path. Most
people open the app in the same couple of hours, so the quota runs out exactly
when the most people are looking.

## The throttle made it worse

My first fix was a throttle in front of the call. It had two problems.

It was per instance, so two containers meant two budgets, and the limit it
enforced was not a number anyone had chosen.

It also sat in front of the scheduled job that was supposed to refill the cache
once the quota recovered. The throttle was there to protect the quota. In
practice it stopped the system from recovering after the quota ran out.

## Take the ability away instead

The replacement is not a limit. Request handlers simply cannot trigger
generation:

```typescript file="generate.ts" accent
// Only the scheduler passes true. Request handlers pass false.
export async function getOrGenerate(userId: string, mayGenerate: boolean) {
  const hit = await readCached(userId);
  if (hit) return hit;

  if (!mayGenerate) return fallback(); // precomputed, always available
  ...
}
```

A scheduled job generates each user's content ahead of time. Opening the app
only reads. There is no threshold to tune, because the request path has no way
to make the call.

## Two details that keep it working

**Failures are not cached.** When generation fails, the user gets the fallback
and nothing is written. If the failure were cached, the next scheduled run would
see a hit and skip that user, and the fallback would stick until something
evicted it. Leaving the miss in place means the next run fixes it.

**Each user is keyed on their own local day.** That makes the job idempotent.
Re-running it after a deploy, a crash or a manual check only spends on users who
have rolled into a new day. Being able to re-run a batch job without thinking
about it is most of its operational value.

## Trade-offs

The cost model flips. Generating for everyone every day scales with the size of
the user table, not with who opens the app, so dormant accounts cost money. That
is the right trade when the daily content is the reason people open the app. For
a product where most signups never come back, a lazy path with a real, shared
limiter is the better choice.

Users the job has not reached yet, such as new signups or someone whose day
rolled over between runs, see the fallback. So the fallback is not an error
state. It is part of the product and needs the same care as the generated
version. Mine did not get that for the first two months.

One smaller fix along the way: usage is counted before the call and refunded if
the call fails, and the refund also has to cover the counter itself throwing.
Otherwise a user loses a credit to an error that never reached the model.

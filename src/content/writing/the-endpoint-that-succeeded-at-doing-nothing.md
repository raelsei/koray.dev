---
title: The endpoint that succeeded at doing nothing
description: >-
  Correct status code, clean logs, zero exceptions, wrong data. What happens to
  the promise you deliberately didn't await.
pubDate: 2026-06-05
tags: [cloudflare]
colophon: written in İstanbul, june 2026 — EOF
---

## the counter that never moved

Detail pages are cached with a long revalidation window, so a view counter cannot
be incremented during render — it would freeze into the cached HTML with
everything else. Standard move: a tiny endpoint the client pings, and don't make
the user wait for it.

```typescript file="beacon.ts"
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  void bumpViews(id).catch(() => {});      // don't block the response
  return new Response(null, { status: 204 });
}
```

The counter did not move. Not slowly, not sometimes — at all. Meanwhile the
endpoint reported success on every call, the platform logged a clean outcome, and
there were no exceptions, no error rate, no timeouts.

This is the worst shape a bug can have. There is nothing to search for. The only
way to see it is to go and read the row.

## no, it isn't a flag

My first explanation was a compatibility flag about carrying promise resolution
across request contexts. That flag is real, it was enabled, and it is not what
happened — it governs continuations scheduled from a *different* request.

The actual rule is duller and much more important: this runtime cancels any
promise still pending when the invocation ends, unless it was handed to the
platform's background-work API. That is default behaviour, not a setting. There
is nothing to turn off, which matters, because "disable the flag and my write
survives" is a comforting and completely wrong conclusion.

So the update was issued and then abandoned somewhere between the isolate and the
commit. I never established where. From the outside the only observable was the
204 I had hardcoded.

## await the thing everyone tells you not to await

```typescript file="beacon.ts" accent
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await bumpViews(id);
  } catch {
    // A transient database blip must not turn a beacon into a 5xx.
  }
  return new Response(null, { status: 204 });
}
```

"Don't await side effects on the response path" is near-universal advice, and it
is correct on a long-lived server where the process outlives the request and the
event loop will get to your promise eventually. Here the process does not outlive
anything.

> Work that outlives the response belongs to whoever owns the lifetime. On a
> normal server that is the process, and it never asks. Here it is the platform,
> and it wants to be asked explicitly.

Being honest about this fix: awaiting is the *second* best answer. The platform's
background-work API extends execution for a bounded window after the response is
sent, and analytics writes are the textbook use for it. I awaited because the
framework's route handler does not hand me the platform context, so that API is
not reachable from this file. Where it is reachable — the cache writes in the
image proxy, which run outside the framework's routing — that is what those use,
and it is the better tool there too.

## the client half fails open

The beacon waits a few seconds before firing, to filter bounces, and dedupes per
browsing session so a re-render doesn't double count. The dedupe **fails open**:
if the storage it uses is unavailable, it fires anyway.

Those two failure modes are not symmetrical. Over-counting is a number slightly
too big. Silently dropping is a number that is wrong in a direction nobody will
investigate, because it looks plausible.

## when this stops working

There is no user-visible latency cost — the beacon never reads the response. The
real cost is coupling: a very high frequency endpoint now fails when the database
does, where before it failed silently and looked fine. That is an improvement,
and it is still a new dependency on the hot path.

There is also no rate limit here. The write is only idempotent-ish, since each
call adds one, so abuse is bounded by obscurity. Deliberate, and the next thing
that breaks.

So: any time you write `void something()`, ask what owns the lifetime after this
function returns. If the answer is "the runtime, I assume", check.

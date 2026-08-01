---
title: Every request returned 204 and every write was thrown away
description: >-
  Correct status code, clean logs, zero exceptions, wrong data. What happens when
  the runtime cancels the promise you deliberately didn't await.
pubDate: 2026-06-05
tags: [cloudflare, edge, debugging]
colophon: written in İstanbul, june 2026 — EOF
---

## the counter that never moved

Detail pages are cached with a long revalidation window, so the view counter
cannot be incremented during render — it would freeze into the cached HTML along
with everything else. Standard move: pull it out into a tiny endpoint the client
pings, and don't make the user wait for it.

```typescript file="view.ts"
export async function POST(req: Request, { params }: Ctx) {
  void bumpViews(params.id).catch(() => {});   // don't block the response
  return new Response(null, { status: 204 });
}
```

Every request returned 204. The platform logged a successful outcome. No
exceptions, no error rate, no timeouts. The counter did not move.

This is the worst shape a bug can have. There is nothing to search for. The only
way to see it is to go and look at the row.

## the flag that explains it

The deployment enables a compatibility flag that stops the runtime carrying
promise resolution across request boundaries. Once the handler returns its
response, any pending promise not registered with the platform's background-work
API is cancelled. Silently — it is not an error, it is the documented behaviour.

So the UPDATE was issued, the isolate returned, and the in-flight query was torn
down somewhere between the connection and the commit. From the outside that is
indistinguishable from success, because from the outside the only observable was
the 204 we hardcoded.

## await the thing everyone tells you not to await

```typescript file="view.ts" accent
export async function POST(req: Request, { params }: Ctx) {
  // The isolate dies with the response. There is no "after" to defer to.
  try {
    await bumpViews(params.id);
  } catch {
    // A transient DB blip must not turn a beacon into a 5xx.
  }
  return new Response(null, { status: 204 });
}
```

"Don't await side effects on the response path" is near-universal advice and it
is correct on a long-lived server, where the process outlives the request and the
event loop will get to your promise eventually. On this runtime there is no
process outliving anything. The advice inverts.

The latency cost is invisible in practice, because the client fires this through
the browser's beacon API and never reads the response.

> Work that must outlive the response has to be handed to whoever owns the
> lifetime. On a normal server that's the process. Here it's the platform, and
> it wants to be asked explicitly.

Genuine background work — the cache writes in the image proxy — goes to the
platform's `waitUntil` instead. That is the right tool, with a bounded budget;
it is not a general-purpose "run this later".

## the client half fails open

The beacon has its own small design, and one decision in it is worth stealing.
It waits three seconds before firing, to filter bounces, and dedupes per session
so a re-render doesn't double count. But the dedupe **fails open**: if session
storage is unavailable, it fires anyway.

The reasoning is that these two failure modes are not symmetrical. Over-counting
is a number that is slightly too big. Silently dropping is a number that is wrong
in a direction nobody will investigate, because it looks plausible.

## what it cost

Awaiting puts a database round trip on the response path of a very high frequency
endpoint, which couples its latency to database health. That is a real trade and
worth naming rather than glossing.

There is also still no rate limit here. The write is only idempotent-ish — each
call adds one — so abuse is bounded by nothing but obscurity. That is a deliberate
deferral, not an oversight, but it is the next thing that breaks.

The general rule I took away: any time you write `void something()`, ask what
owns the lifetime after this function returns. If the answer is "the runtime, I
assume", check.

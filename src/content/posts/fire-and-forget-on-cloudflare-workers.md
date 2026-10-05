---
title: "Fire-and-forget doesn't survive on Cloudflare Workers"
description: "A view counter returned 204 on every call and never moved. Workers can cancel work still pending after the response unless it is passed to waitUntil."
pubDatetime: 2026-06-05T06:00:00.000Z
tags: [cloudflare, correctness]
---

Detail pages are cached with a long revalidation window, so a view counter
cannot be incremented during render; the count would freeze into the cached
HTML. The standard alternative is a small endpoint the client pings, without
making anyone wait for the write:

```typescript file="beacon.ts"
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  void bumpViews(id).catch(() => {}); // don't block the response
  return new Response(null, { status: 204 });
}
```

The counter never moved. Not slowly, not sometimes: never. The endpoint returned
204 on every call, the logs were clean, and there were no exceptions, errors or
timeouts. The only way to see the bug was to read the row in the database.

## Why the write disappeared

This runs on Cloudflare Workers, where a request does not live inside a
long-running process. Once the response is done, the runtime can cancel any work
still pending unless it was registered with `ctx.waitUntil()`. That is the
default behaviour, not a setting.

My first guess was a compatibility flag about promises that cross request
contexts. It was enabled, but it is unrelated: it covers continuations scheduled
from a different request. There is no flag to turn off here.

So the update was started and then abandoned somewhere before it committed. The
only thing visible from outside was the 204 I had hard-coded.

## The fix: await it

```typescript file="beacon.ts" accent
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    await bumpViews(id);
  } catch {
    // A database blip must not turn a beacon into a 5xx.
  }
  return new Response(null, { status: 204 });
}
```

"Don't await side effects on the response path" is good advice on a long-lived
server, where the process outlives the request and gets to the promise
eventually. On Workers nothing outlives the request unless you ask for it.

For this endpoint, awaiting costs nothing anyone sees, because the client never
reads the response. Where latency matters, `ctx.waitUntil()` is the right tool:
it keeps the invocation alive for a bounded time after the response is sent. In
Next.js, `after()` does the same job on platforms that back it with `waitUntil`.
The cache writes in the image proxy, which runs outside Next's routing, use
`waitUntil` directly.

## The client side fails open

The beacon waits a few seconds before firing, to skip bounces, and deduplicates
per browsing session so a re-render does not count twice. If the session storage
it relies on is unavailable, it fires anyway.

That is deliberate. Over-counting gives a number slightly too high. Silently
dropping gives a number that is wrong in a direction nobody investigates,
because it looks plausible.

## Trade-offs

The endpoint now fails when the database does. Before, it failed silently and
looked fine. That is an improvement, and it is still a new dependency on a
high-traffic path.

There is no rate limit. Each call adds one, so the count is only as trustworthy
as the endpoint is obscure. That is a known gap.

The general check: whenever you write `void something()`, ask what keeps it
alive after the function returns. If the answer is "the runtime, probably",
verify it.

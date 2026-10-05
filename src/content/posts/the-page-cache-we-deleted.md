---
title: We moved our page cache to R2, then deleted it
description: "R2 charges 12.5 times more for a write than a read. Rendered HTML that revalidates on a timer is the worst workload for that pricing, and images are the best."
pubDatetime: 2026-05-14T06:00:00.000Z
tags: [caching, cloudflare, cost]
---

The site runs Next.js on Cloudflare Workers. Rendered pages were cached in
isolate memory, so every isolate in every location started cold and rendered
pages on its own.

The obvious fix was a shared store. Here is how that went:

1. Rendered pages written to Workers KV.
2. KV replaced with R2 behind a custom cache handler: a key prefix per deploy,
   TTL checked on read, cache tags read from object metadata, and a short
   in-memory tag cache to avoid listing on every lookup. A lifecycle rule
   deleted old prefixes.
3. Longer revalidation windows, to cut writes.
4. Another pass to cut writes: deduplication, longer TTLs, and a pinned build
   id, since an unstable one rewrote every key on every deploy.
5. Deleted all of it.

Steps three and four were the warning sign: two rounds in a row of tuning the
cache to do less.

## What we were paying for

On [R2](https://developers.cloudflare.com/r2/pricing/), a write (Class A)
costs $4.50 per million and a read (Class B) $0.36 per million, so a write costs
12.5 times as much. The useful question is not whether the cache hits. It is how
many writes each useful read costs.

Rendered HTML is the wrong shape for that. There are many pages, each worth
little, and they revalidate on a timer, so the store pays a write per page per
window whether or not anyone visited. Listing objects to find tags is a Class A
operation too, which made the tag index cost more than the pages it indexed.

Every fix we tried was a way to write less often, which means making the cache
worse at its job. When all your tuning points that way, the design is wrong, not
the settings.

## The same code, kept for images

We did not throw the code away. The per-deploy prefix, the lifecycle rule and
the layered lookup still run, for image thumbnails:

```typescript file="image-cache.ts" accent
const inflight = new Map<string, Promise<Response>>();

async function get(url: string, key: string) {
  // The edge cache keys on a Request and only matches GET.
  const req = new Request(url);
  try {
    const edge = await caches.default.match(req);
    if (edge) return edge;

    const stored = await bucket.get(key);
    if (stored) return respond(stored);
  } catch {
    // A cache-layer fault is a miss, never a 500.
  }

  let fetching = inflight.get(key);
  if (!fetching) {
    fetching = fetchAndStore(url, key).finally(() => inflight.delete(key));
    inflight.set(key, fetching);
  }
  // A Response body can only be read once, so each caller gets a clone.
  return (await fetching).clone();
}
```

Images are the opposite workload. They never change, so each one is written
once. They are requested often, so that write pays for itself. And they are
expensive to regenerate, so a miss actually hurts.

Persist what is immutable and expensive to produce. Do not persist what is
numerous and cheap to regenerate.

## What made deleting it safe

Going back to per-isolate caching gives up sharing rendered HTML across
locations. That would have been a regression, except for two things.

First, the CDN in front now caches the HTML. That needed an explicit override,
because the adapter sends `Cache-Control: private, no-cache`. `private` is the
part that matters: it forbids shared caches from storing the response at all.
`no-cache` is the one people misread; it allows storage and requires
revalidation.

Second, the queries behind the pages had been made cheap separately, so a
re-render was no longer worth avoiding at the price of a write per page.

The page cache was solving a problem that two cheaper layers were better placed
to solve. We only learned that by paying for it first.

## Limits

The in-flight map lives in module scope, which on Workers means one per isolate.
It merges concurrent misses inside an isolate, not across the fleet. A key that
is cold everywhere still costs one write per location that asks for it. That is
far less than the page cache paid, but it is not zero. If it ever matters, the
next step is a coordination primitive such as a Durable Object, not a bigger
map.

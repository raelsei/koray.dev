---
title: We built a distributed page cache, then deleted it
description: >-
  Three rounds of tuning to cut the write bill, then removal. The same machinery
  stayed for images, which is the part worth understanding.
pubDate: 2026-05-14
tags: [cloudflare, caching, cost]
colophon: written in İstanbul, may 2026 — EOF
---

## the obvious idea

The framework adapter's incremental page cache defaults to in-process memory. On
a distributed edge runtime that means every isolate in every location is cold and
re-renders independently. Two hundred locations, two hundred first renders.

The obvious fix is to persist rendered pages to a shared store, and we did:

1. Pages written to the platform's eventually-consistent key-value store.
2. Swapped it for object storage behind a custom cache handler — versioned key
   prefix, read-time TTL invalidation, tag discovery through object metadata, a
   short in-memory tag cache so we weren't re-listing constantly. Deploy cutover
   by bumping the prefix, old objects aged out by a lifecycle rule.
3. Extended the revalidation windows, explicitly to cut write volume.
4. A dedicated pass to cut write-class operations: dedupe, longer TTLs, and
   pinning the build id so a deploy didn't rewrite every key at once.
5. Deleted the whole thing.

Steps three and four are the tell. Each was treating a symptom, and there were
two of them in a row.

## what we were actually paying for

Object storage bills reads cheaply and writes expensively. So the question is not
"does the cache hit" but *how many writes does one useful read cost*.

Rendered HTML is the bad shape for this. Pages are numerous, individually
low-value, and revalidate on a timer — which means the store is charged a write
per page per window across the entire surface, forever, whether or not anybody
asked for that page. The cache was doing exactly what we designed it to do, and
the design was upside down.

Every mitigation we reached for was a way of writing less often, which is a way
of saying the cache should be worse. When the tuning direction is "make it do its
job less", the thing to change is not the tuning.

## the same machinery, kept

Here is the part that makes this a design lesson and not a war story: we did not
throw the code away. The versioned prefix, the lifecycle rule, the tiered lookup
— all of it still runs, on thumbnails.

```typescript file="thumb-cache.ts" accent
// Edge cache -> object storage -> upstream. One in-flight fetch per key:
// concurrent misses share it, so a cold key costs one write, not eighty.
const inflight = new Map<string, Promise<Response>>();

async function get(key: string, url: string) {
  const edge = await caches.default.match(key);
  if (edge) return edge;

  const stored = await bucket.get(key);
  if (stored) return respond(stored);

  let fetching = inflight.get(key);
  if (!fetching) {
    fetching = fetchAndStore(url, key).finally(() => inflight.delete(key));
    inflight.set(key, fetching);
  }
  return fetching;
}
```

Images are the inverse workload. Immutable, so a write is paid once and never
again. Highly reused, so that one write amortises across every subsequent
request. Expensive to regenerate, so a miss actually hurts.

> Persist what is immutable and expensive. Don't persist what is numerous and
> cheap to regenerate. Same primitive, opposite verdicts.

The single-flight map is the other half. Without it, a cold popular key means
every concurrent miss independently fetches upstream and independently writes —
the exact write amplification that killed the page cache, in miniature. Negative
results are cached at the edge tier only, and a fault in the cache layer degrades
to a miss rather than a 500.

## what made the removal safe

Reverting to in-process page caching gives up cross-location reuse of rendered
HTML. That would be a straight regression, except two other things were true.

The CDN in front was separately configured to cache the HTML. This needed an
explicit override, because the adapter emits `private, no-cache` on those
responses, which tells the CDN not to cache at all. Worth checking: a header you
never set is still a header.

And the underlying queries were cheap, because a separate fix had made the
database's own result cache actually engage. A re-render was no longer expensive
enough to be worth avoiding at the cost of a write per page per window.

Neither of those is free, and if you don't have both, this reversal is a
regression rather than a cleanup. The reason to write it down is the ordering:
the page cache was solving a problem that two cheaper layers were better placed
to solve, and we only found that out by paying for the expensive version first.

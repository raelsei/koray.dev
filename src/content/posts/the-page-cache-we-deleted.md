---
title: We built a distributed page cache, then deleted it
description: Three rounds of tuning to cut the write bill, then removal. The same machinery stayed for images.
pubDatetime: 2026-05-14T06:00:00.000Z
tags: [caching, cloudflare, cost]
---

## the obvious idea

The framework adapter's incremental page cache defaults to in-process memory. On
a distributed edge runtime that means every isolate in every location is cold and
re-renders independently.

The obvious fix is to persist rendered pages to a shared store, and we did:

1. Pages written to the platform's eventually-consistent key-value store.
2. Swapped for object storage behind a custom cache handler: a versioned prefix,
   TTL checked on read, tags discovered from stored metadata, and a short
   in-process tag cache so we weren't listing on every lookup. Deploys moved to a
   new prefix and a lifecycle rule aged out the old one.
3. Extended the revalidation windows, explicitly to cut write volume.
4. A pass to cut write-class operations: dedupe, longer TTLs, and a pinned build
   id, because an unstable one rewrites every key on every deploy.
5. Deleted the whole thing.

Steps three and four are the tell. Each treated a symptom, and there were two of
them in a row.

## what we were actually paying for

Object storage bills writes at roughly twelve times reads. So the question is not
"does the cache hit" but _how many writes does one useful read cost_.

Rendered HTML is the bad shape. Pages are numerous, individually low-value, and
revalidate on a timer — so the store is charged a write per page per window
across the whole surface, whether or not anyone asked for that page. Listing to
discover tags is itself a write-class operation, which made the tag machinery
more expensive than the thing it was indexing.

Every mitigation we reached for was a way of writing less often, which is a way
of saying the cache should be worse at its job. When the tuning direction is
"make it do less", the thing to change is not the tuning.

## the same machinery, kept

We did not throw the code away. The versioned prefix, the lifecycle rule, the
tiered lookup — all of it still runs, on thumbnails.

```typescript file="image-cache.ts" accent
const inflight = new Map<string, Promise<Response>>();

async function get(url: string, key: string) {
  // The edge cache keys on a Request, and only matches GET.
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
  // A Response body is a single-use stream, so every caller needs its own.
  return (await fetching).clone();
}
```

Images are the inverse workload. Immutable, so a write is paid once. Highly
reused, so that write amortises. Expensive to regenerate, so a miss actually
hurts.

> Persist what is immutable and expensive. Don't persist what is numerous and
> cheap to regenerate. Same primitive, opposite verdicts.

## when this stops working

The single-flight map is module scope, which on this runtime means per isolate.
It collapses concurrent misses _inside_ one isolate; it does nothing across the
fleet. A globally cold key still costs one write per location that gets asked —
the same fan-out the page cache died of, reduced by a couple of orders of
magnitude rather than removed. If that ever stops being enough, the honest next
step is a coordination primitive, not a bigger map.

Reverting to in-process page caching gives up cross-location reuse of rendered
HTML, and that would be a straight regression except two other things were true.
The CDN in front was configured to cache the HTML, which needed an explicit
override: the adapter marks those responses `private, no-cache`, and `private`
is the operative half — it forbids a shared cache from storing them at all.
(`no-cache` is the commonly misread one; it permits storage and demands
revalidation.) And the underlying queries had separately been made cheap, so a
re-render was no longer worth avoiding at the cost of a write per page per
window.

Without both of those, this reversal is a regression rather than a cleanup. The
ordering is the part worth keeping: the page cache was solving a problem two
cheaper layers were better placed to solve, and we only found that out by paying
for the expensive version first.

_written in İstanbul, may 2026 — EOF_

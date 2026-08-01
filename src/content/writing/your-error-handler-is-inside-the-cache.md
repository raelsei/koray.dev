---
title: Your error handler is inside the cache
description: >-
  A container restart took thirty seconds. The site stayed broken for an hour
  after it came back.
pubDate: 2026-04-23
tags: [caching, correctness]
colophon: written in İstanbul, april 2026 — EOF
---

## a restart that outlived itself

The page loader did the defensive, obviously-correct thing:

```typescript file="page-data.ts"
'use cache';

export async function getPage(slug: string) {
  try {
    return await cms.fetchOne('pages', slug);
  } catch {
    return undefined;               // degrade gracefully
  }
}
```

The caller mapped `undefined` to a 404. Fine everywhere else in the codebase.
Not fine here, because of the directive on line one.

The content backend restarted — routine, about thirty seconds. During that window
every detail and landing page threw, caught, and returned `undefined`. The cache
saw a function that completed normally and returned a value, so it stored the
value. The backend came back healthy. The site kept serving 404s for the rest of
the cache lifetime.

Nothing was broken by then. The outage had been over for an hour. We had cached
our own opinion of it.

## the fix is a deletion

```typescript file="page-data.ts" accent
'use cache';

// Deliberately uncaught. This cache stores what a function returns, and an
// absent page and an unreachable backend must not return the same thing.
// Catching here converts a half-minute outage into a full-lifetime one.
export async function getPage(slug: string) {
  return cms.fetchOne('pages', slug);
}
```

Let it throw. Nothing is stored, so the next request retries and the page heals
itself. An empty result from a query that *succeeded* is still perfectly
cacheable.

The comment is load-bearing. The next person to read this file will want to put
the try/catch back, because catching at an I/O boundary is what they have
correctly been taught to do everywhere else.

> Inside a memoisation boundary, an error and an empty result must not be
> representable by the same value. Error handling does not compose across a
> cache.

## the same bug, one layer up

A month or so later, same class, different mechanism. The static params generator
swallowed a backend failure into an empty array, with a comment asserting the
route would simply fall back to rendering on demand. That had been true under the
previous rendering model. Under the one this codebase is now on — the one the
cache directive requires — an empty params array is a hard build error.

Which is the good outcome, and the reason to prefer it: the build fails, nothing
ships, and the previous image keeps serving.

The detail I keep coming back to is the comment. It documented a guarantee the
framework had silently withdrawn between major versions. The code was correct
when written and became wrong without being edited.

## where catching is still right

This is not a rule against try/catch. The same codebase still catches and returns
an empty list for a secondary listing in the sidebar, which has a fallback query
behind it and for which an empty result is a legitimate page.

The judgement is per-fetch: **is this fetch load-bearing for the page's
identity?** If the page is meaningless without it, the error must propagate. If
the page is merely less good, degrade and cache. What you cannot do is apply one
policy to both, which is exactly what a lint rule or a shared wrapper pushes you
toward.

## when this stops working

Users now see an error page during a backend outage. That is the correct trade
here: the alternative was a cached 404, and a 404 tells a crawler the page is
gone — which crawlers remember better than we did. A 5xx tells them to come back.

The larger caveat is that the fix rests on a guarantee I did not write and cannot
find documented: that this cache layer stores returned values and not rejected
ones. I verified it; it is not a promise. It also does not generalise — one layer
down, a fetch that resolves to a 500 is a *returned* response and gets stored
like any other value.

Which is the same shape as the comment two sections up. If that behaviour is ever
withdrawn, this file becomes wrong without being edited, exactly like the last
one did.

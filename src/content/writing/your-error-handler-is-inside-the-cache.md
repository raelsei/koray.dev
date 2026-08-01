---
title: Your error handler is inside the cache
description: >-
  A container restart took thirty seconds. The site stayed broken for an hour,
  because the graceful degradation got written into the cache as a success.
pubDate: 2026-04-23
tags: [caching, incident, resilience]
colophon: written in İstanbul, april 2026 — EOF
---

## a restart that outlived itself

The page loader did the defensive, obviously-correct thing:

```typescript file="_data.ts"
'use cache';

export async function getPage(slug: string) {
  try {
    return await cms.readItem('pages', slug);
  } catch {
    return undefined;               // degrade gracefully
  }
}
```

The caller mapped `undefined` to a 404. Fine everywhere else in the codebase.
Not fine here, because of the directive on line one.

The content backend restarted — routine, about thirty seconds. During that
window every product and landing page threw, caught, and returned `undefined`.
The cache saw a function that completed normally and returned a value, so it
stored that value. The backend came back healthy. The site kept serving 404s for
the remainder of the cache lifetime.

Nothing was broken by then. The outage had been over for an hour. We had cached
our own opinion of it.

## the fix is a deletion

```typescript file="_data.ts" accent
'use cache';

// Do not add a try/catch here. A thrown error is never cached; a returned
// undefined is. Catching turns a 30s outage into a full-TTL outage.
export async function getPage(slug: string) {
  return cms.readItem('pages', slug);
}
```

Let it throw. The cache layer does not persist errors, so the request becomes
self-healing: the next hit retries, and nothing is stored until a real answer
arrives. A genuinely empty result from a *successful* query is still a perfectly
cacheable 404 — that distinction is the whole point.

The comment is load-bearing. The next person to read this file will want to put
the try/catch back, because catching errors at an I/O boundary is what they have
correctly been taught to do everywhere else.

> Inside a memoisation boundary, an error and an empty result must not be
> representable by the same value. Error handling does not compose across a
> cache.

## the same bug, one layer up

Five weeks later, same class, different mechanism. The static params generator
swallowed a backend failure into `[]`, with a comment claiming the route would
"stay fully dynamic" — which had been true under the previous rendering model.
Under the current one, an empty params array is a hard build error, and every
path 500s at runtime.

Same fix: let it throw, fail the build loudly, keep the previous image serving.

The detail I keep coming back to is the stale comment. It documented a guarantee
the framework had silently withdrawn between major versions. The code was
correct when written and became wrong without being edited.

## where catching is still right

This is not a rule against try/catch, and the same codebase still catches and
returns an empty list on the sidebar's related-articles fetch. That fetch has a
fallback query behind it, and an empty sidebar is a legitimate page.

The judgement is per-fetch, and the question is: **is this fetch load-bearing for
the page's identity?** If the page is meaningless without it, an error must
propagate. If the page is merely less good without it, degrade and cache.

What you cannot do is apply one policy to both, which is what a linter rule or a
blanket wrapper would push you toward.

## the cost of getting it right

Users see an error page during a backend outage instead of a soft-degraded one.
For a page whose entire content comes from that backend, that is the correct
trade — a 404 tells a crawler the page is gone, and crawlers are considerably
better at remembering that than we were.

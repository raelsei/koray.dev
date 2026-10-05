---
title: Your error handler is inside the cache
description: 'A thirty-second backend restart became an hour of 404s, because a try/catch inside a "use cache" function cached the failure as a value.'
pubDatetime: 2026-04-23T06:00:00.000Z
tags: [caching, correctness]
---

The page loader did the defensive thing:

```typescript file="page-data.ts"
"use cache";

export async function getPage(slug: string) {
  try {
    return await cms.fetchOne("pages", slug);
  } catch {
    return undefined; // degrade gracefully
  }
}
```

The caller turned `undefined` into a 404. That pattern was fine everywhere else
in the codebase. It was not fine here, because of the first line.

The CMS backend restarted, which took about thirty seconds. During that window
every page fetch threw, got caught, and returned `undefined`. To the cache, the
function had finished normally and returned a value, so it stored the value. The
backend came back, and the site kept serving 404s for the rest of the cache
lifetime, about an hour.

## The fix is to delete the catch

```typescript file="page-data.ts" accent
"use cache";

// Deliberately uncaught. The cache stores whatever this returns, so a missing
// page and an unreachable backend must not return the same value.
export async function getPage(slug: string) {
  return cms.fetchOne("pages", slug);
}
```

If the fetch throws, nothing is cached and the next request tries again. An
empty result from a fetch that succeeded is still safe to cache.

The comment matters. The next person to read this file will want to put the
try/catch back, because catching at an I/O boundary is what they have been
taught to do everywhere else.

Inside a cached function, an error and an empty result must never be the same
value.

## The same bug at build time

A month later the same mistake turned up somewhere else. `generateStaticParams`
caught a backend failure and returned an empty array, with a comment saying the
route would fall back to rendering on demand. That was true under the old
rendering model. Under Cache Components, the model `"use cache"` runs on, an
empty array is a build error.

That is the better failure: the build stops, nothing ships, and the previous
deployment keeps serving. But the comment described a guarantee the framework
had dropped between major versions. The code was correct when it was written and
became wrong without anyone touching it.

## When catching is still right

This is not a rule against try/catch. The same codebase still catches errors for
a secondary list in the sidebar, which has a fallback query behind it and for
which an empty list is a valid page.

The question is per fetch: does the page make sense without this data? If not,
let the error propagate. If the page is only less complete, degrade and cache. A
shared wrapper or a lint rule pushes you to apply one policy to both, and that
is the mistake.

## Trade-offs

During a backend outage, users now see an error page instead of a 404. That is
intended. A 404 tells crawlers the page is gone, and they remember. A 5xx tells
them to come back later.

The fix also rests on behaviour I verified but could not find documented: that
this cache stores returned values and not thrown errors. It does not hold one
layer down, either. A `fetch` that resolves with a 500 is a returned value and
gets cached like any other. If the cache's behaviour ever changes, this file
becomes wrong without being edited, just like that comment did.

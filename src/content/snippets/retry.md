---
title: retry.ts
note: backoff with jitter, 14 lines
description: >-
  Exponential backoff with full jitter and a hard ceiling. Small enough to
  paste, correct enough not to build a thundering herd.
order: 2
tags: [typescript, reliability]
---

Retrying on a fixed interval synchronises every client that failed at the same
moment, so the recovering service is hit by the whole fleet at once. Jitter
spreads them out; the cap stops the tail from waiting minutes.

```typescript file="retry.ts"
export async function retry<T>(
  fn: () => Promise<T>,
  { tries = 5, base = 200, cap = 8000 } = {}
): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { last = e; }
    const wait = Math.min(cap, base * 2 ** i) * (0.5 + Math.random());
    await new Promise((r) => setTimeout(r, wait));
  }
  throw last;
}
```

It rethrows the *last* error rather than a wrapper, so the stack still points at
whatever actually failed. Do not wrap this around anything non-idempotent — a
payment capture that times out may already have succeeded.

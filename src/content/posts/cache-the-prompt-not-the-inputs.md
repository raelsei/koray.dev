---
title: Cache the prompt, not the inputs
description: "An LLM cache keyed on a hand-picked list of inputs fell behind the prompt it protected. Hashing the rendered prompt fixed it, and the choice of hash turned out to be a security decision."
pubDatetime: 2026-06-27T06:00:00.000Z
tags: [llm, caching]
---

A user edited an earlier entry and got the morning's answer back. Then a
settings change did not take effect. In a support ticket, both look like the
model being inconsistent.

They were not. Generated summaries were cached per user per day, keyed on the
inputs someone had decided mattered: the entry text, the date and the plan tier.
That list was written once. The prompt template had gained three fields since,
and none of them were in the key.

A hand-maintained list of "things that affect the answer" falls out of sync with
the prompt every time the prompt changes. No test catches it, because the test
would need the same list.

## Hash what the model actually sees

```typescript file="key.ts" accent
// The key is derived from the prompt itself, so every field the model reads is
// part of it, including fields added after this line was written.
const rendered = buildPrompt({ entry, settings, context, tier, lang });
const key = `${userId}:${localDay}:${digest(rendered)}`;
```

Call the real prompt builder and hash its output: the exact string that will be
sent, not a subset and not a normalised copy.

This moves the maintenance burden. Before, adding a field to the prompt meant
remembering to add it to the key. Now adding a field to the prompt adds it to
the key.

One deliberate exception: the entry text is trimmed before the prompt is built,
so a resubmit that differs only by a trailing newline still hits the cache.

## The hash is a security decision

My first version used a 32-bit non-cryptographic hash. I checked it against the
birthday bound, about 77,000 entries for a 50% chance of a collision, and
decided that was far enough away.

That was the wrong threat model. Part of the hashed string is text the user
wrote, and collisions in a non-cryptographic hash can be constructed on purpose
in milliseconds. A collision in this cache means serving one user text that was
generated for another.

Two cheap fixes:

- Use a truncated cryptographic digest such as SHA-256, so nobody can construct
  a collision.
- Put the user id and the day in the key, so even an accidental collision cannot
  cross from one user to another.

The first version had no user component at all. My birthday-bound estimate was
for a namespace I had accidentally made global.

The number was wrong for the accidental case too. 77,000 is the 50% point. The
chance is already 1% at about 9,300 entries, and nobody would sign off on a 1%
chance of leaking a user's private text if it were put that way.

## Trade-offs

Any template change now invalidates every entry. That is correct, since the old
text came from a prompt that no longer exists, but it causes a burst of
regeneration right after a deploy. The single-flight map from
[the image cache](/posts/the-page-cache-we-deleted/) would smooth that out. I
have not added it here, because regeneration is cheap enough that the burst has
never been a problem.

The key is only correct if the prompt builder is deterministic. A timestamp, a
random id or object keys in unstable order in the rendered prompt silently drop
the hit rate to zero, which looks the same as a cache that is merely cold.

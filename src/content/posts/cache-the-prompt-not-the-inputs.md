---
title: Cache the prompt, not the inputs
description: The key listed the inputs someone believed mattered. The prompt had grown three fields since, and nothing in the system could have noticed.
pubDatetime: 2026-06-27T06:00:00.000Z
tags: [llm, caching]
---

## the bug that looks like nondeterminism

A user edited an earlier entry and got the morning's answer back. Then a settings
change didn't take. From a support ticket both look like the model being flaky.

Neither was. Generated summaries were cached per user per day, keyed on a tuple
of the inputs that mattered: the submitted text, the date, the tier. That list
was written once and the prompt template had grown three fields since. A
hand-maintained list of "the things that go into the answer" drifts out of sync
with the prompt on every prompt change, silently, and no test can notice because
the test would have to hold the same list.

## hash what the model actually sees

```typescript file="key.ts" accent
// The key is the prompt. Every field the model will read participates by
// construction, including the ones added after this line was written.
const rendered = buildPrompt({ entry, settings, context, tier, lang });
const key = `${userId}:${localDay}:${digest(rendered)}`;
```

Call the real assembly function and hash its output, the actual string that will
be sent, not a subset and not a normalised copy.

This inverts the maintenance burden. Before, adding a field to the prompt meant
remembering to add it to the key. Now adding a field to the prompt _is_ adding it
to the key.

One deliberate exception: the input text is trimmed before hashing, so a resubmit
differing only by a trailing newline still hits.

> A cache key derived from the thing it protects cannot fall behind it.

## the hash is a security decision, not a sizing one

My first version used a 32-bit non-cryptographic hash and my first instinct about
its limits was the birthday bound: around 77,000 entries for an even chance of
collision, comfortably far away.

That was the wrong threat model, and being wrong about it is more interesting
than the original bug.

Part of the hashed string is text the user wrote. A non-cryptographic hash is
trivially invertible, so a collision here is not something you wait for; it is
something anyone can construct in milliseconds. And the consequence of a
collision on this cache is serving one user the text generated for another.

Two corrections, both cheap. Use a truncated cryptographic digest, so a collision
cannot be _aimed_. And namespace the key by user and day, so even an accidental
one cannot cross a tenant boundary. The second is what the earlier version was
missing entirely: it had no user component at all, which made the sizing argument
doubly irrelevant; it was reasoning about the birthday bound of a namespace it
had accidentally made global.

For the record, 77,000 is also the wrong number to plan against even when the
threat is accidental. It is the 50% point. The chance is already 1% at nine
thousand entries, and a 1% chance of leaking a user's private text is not a
budget anyone would sign off on if it were phrased that way.

## when this stops working

Hashing the rendered prompt means any template edit invalidates every entry
globally. That is correct, since the old text came from a prompt that no longer
exists, but it is a stampede on the first request after deploy, and it is worth
knowing that before shipping a wording tweak on a Friday. The single-flight trick
that fixes exactly this is one post over; I have not applied it here, because the
regeneration is cheap enough that the stampede has never been the thing that
hurt.

And the key is only as complete as the assembly function is deterministic. Put a
timestamp, a random id, or an unsorted object in the rendered prompt and the
cache silently stops working, with a 0% hit rate that looks identical to a cache
that is merely cold.

_written in İstanbul, june 2026 · EOF_

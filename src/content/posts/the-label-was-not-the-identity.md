---
title: "Three bugs, one root cause: the label was not the identity"
description: A rendering layer derives a human label from a machine identity. Both are strings. The type checker has nothing to say and the money path does.
pubDatetime: 2026-07-04T06:00:00.000Z
tags: [correctness, signing]
featured: true
---

## five names for one thing

Upstream names a tradable instrument with one bare field. Everything a person
reads is synthesised locally: the pair label, the URL slug, the quote leg. And
the thing the wire wants is none of those — it is a numeric address that looks
like an array index and is not one, on any instrument listed by a third-party
operator rather than the venue itself.

So one instrument carries five identities at once: what the screen shows, what
the URL says, what the local cache keys on, what position it holds upstream, and
what number the signed request must contain.

```typescript file="address.ts" accent
// Operator-listed instruments live in a flat address space carved out above the
// core range. Group zero is the venue's own list and must never be offset.
export const wireAddress = (groupIndex: number, localIndex: number) => {
  if (groupIndex === 0) return localIndex;
  if (groupIndex < 0) throw new RangeError('unknown listing group');
  return ADDRESS_BASE + groupIndex * GROUP_SPAN + localIndex;
};
```

Nothing about that is clever. The bugs did not come from the arithmetic.

## bug one: the formula existed twice

The order form computed the address correctly. The positions panel sent the raw
local index.

On a venue-listed instrument those are the same number, which is why it worked
everywhere anyone looked. On an operator-listed one, a close or a cancel was
addressed at whichever unrelated core instrument happened to occupy that index.
Best case it was rejected. Worst case it was a valid instruction aimed at
something the user did not own.

The fix was not to paste the formula into the second call site. It was one
exported function, unit-tested, plus a check asserting the base constant appears
in exactly one file.

> A formula at two call sites is not duplicated code. It is two implementations
> that happen to agree today.

## bug two: the label went where the identity belonged

A formatted pair label was passed into a component whose prop was named for the
symbol, and whose lookup matched against the upstream bare field. The label and
the field are both strings, so this compiled, rendered, and shipped.

The visible result was a position size that read as permanently zero. The
invisible result was worse: a preflight step that skips itself when the current
value already matches never engaged, because the comparison was against a
position it could not find.

There is no exception in this story either. There is a panel showing zero, which
looks exactly like a panel showing a true zero.

## bug three: the same shape again

A trailing-zero strip in the serialiser ate the zeros of whole-number sizes.
Different function, different week, same underlying move: a value was treated
according to how it *reads* rather than what it *is*.

Three bugs, all on the money path, all from the same root, all invisible to the
compiler because every identity in the system is spelled `string` or `number`.

## what actually fixes it

The honest answer is branded types — give each identity its own nominal type so
passing a label where an address belongs is a compile error rather than a
support ticket. I did not do it. It means a cast at every upstream boundary,
which on a surface this size is a lot of ceremony bought with real friction.

What I did instead, in descending order of how much it helped:

- **One derivation, one file.** The address formula exists in exactly one place
  and a grep gate keeps it there. This is the whole fix for bug one.
- **Name the prop after the identity, not the display.** A prop called
  `symbol` invites a symbol-looking string. A prop called `instrumentKey` with
  a documented contract at the call site does not.
- **Make the wrong thing loud.** Group zero throwing rather than silently
  offsetting turned a class of silent misaddressing into a startup error.

## when this stops working

None of that is enforcement. Everything above is convention plus one grep, and
a fourth instance of the same bug is a matter of time — the type system still
cannot tell a label from an address.

The session-level cache of the listing groups has its own version of the
problem: an instrument listed mid-session resolves against a stale group index
until the page reloads. Rejected fetches are dropped from the cache correctly;
successful-but-stale ones are not, because staleness is not an error and nothing
in the code can see it.

Which is the pattern, one level up. Every bug here was a value that was wrong
while being perfectly well-formed.

_written in İstanbul, july 2026 — EOF_

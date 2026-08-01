---
title: Math.floor is not a floor
description: >-
  Serialising a decimal at a system boundary, where rounding the wrong way by one
  step leaves residue behind and nobody gets an exception.
pubDate: 2026-02-26
tags: [typescript, precision, money]
colophon: written in İstanbul, february 2026 — EOF
---

## the missing step

A downstream system accepts numeric fields as strings, with a per-asset decimal
precision that must be **floored**, never rounded. Standard implementation:

```typescript file="wire.ts"
const toWire = (value: number, decimals: number) =>
  String(Math.floor(value * 10 ** decimals) / 10 ** decimals);
```

Everyone writes this. It looks obviously correct. It passes the tests you would
think to write, because the inputs that break it are ordinary decimals rather
than exotic ones.

```text file="repl.txt" accent
> 0.29 * 100
28.999999999999996
> Math.floor(0.29 * 100) / 100
0.28
```

The binary representation of `0.29` sits a hair below the decimal value. Multiply
and it stays below. Floor and you have dropped a whole step.

At two decimals on a quantity field, that means a user who asks to close a
position in full closes slightly less than full and leaves residue behind. No
exception, no rejection, no log line. Just a small remainder that shouldn't exist
and a support ticket three days later.

## the guard digit

```typescript file="wire.ts" accent
// Render with one extra digit, then truncate the string. toFixed can only
// round the guard digit, so every retained digit is exact — and cutting a
// decimal string is an exact floor by construction.
const toWire = (value: number, decimals: number) => {
  const s = value.toFixed(decimals + 1);
  const cut = s.slice(0, -1);
  return cut.endsWith('.') ? cut.slice(0, -1) : cut;
};
```

Render one digit wider than you need, then cut the string. `toFixed` does the
decimal conversion properly and the only digit it can corrupt is the guard digit,
which you are about to discard. Truncating a decimal string is an exact floor,
with no arithmetic left to go wrong.

Fifteen lines, one boundary, and the entire class of off-by-one-step disappears.

## the exemption nobody reads

The same boundary has a significant-figure cap on prices — with an exemption for
integers. Implement the headline rule, skip the exemption, and a round-number
limit price gets silently rewritten to a nearby different number.

```typescript file="wire.ts"
const priceToWire = (value: number) =>
  Number.isInteger(value) ? String(value) : trimZeros(value.toPrecision(5));
```

An early return, above the rounding. Precision specs are mostly exemptions and
nobody reads past the first paragraph, including the person who wrote the first
paragraph.

And then the third bug, found in review of the fix for the first two: stripping
trailing zeros without checking for a decimal point at all turns a quantity of
`1200` into `12`. A hundredfold error, on assets with zero decimal precision,
introduced by a cleanup.

> Three separate bugs on one code path, and not one of them produced an error.
> They produced numbers — plausible ones, slightly wrong.

## characterization tests first

The fix was executed in an order worth copying, because the temptation is to go
straight to the correct implementation.

Write tests that encode **today's** behaviour and the desired behaviour first.
Run them. Confirm that exactly the expected set fails — and stop if anything else
does, because then the contract is not what you assumed and your fix is
speculation. Only then change one function at a time, re-running in between.

That discipline is what caught the trailing-zero bug: it was not in the original
audit, and it was not in the plan. It showed up in a review of the resulting diff
because the diff was small enough to read.

## one formula, one file

A related failure in the same codebase: an identifier computed as
`base + namespace * stride + index`. The formula was correct where a position
was opened, and simply missing where it was closed and cancelled — so those paths
addressed whichever unrelated resource happened to share the local index.

The fix was not to paste the formula into two more places. It was to extract it
into one pure, tested resolver, and add a check asserting the base constant
appears in exactly one file in the repository.

A formula duplicated at two call sites is not duplicated code. It is two
implementations that agree today.

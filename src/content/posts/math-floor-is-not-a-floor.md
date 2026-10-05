---
title: Math.floor is not a floor
description: "Flooring a decimal for an API that wants strings: the obvious version drops a step, the clever one rounds up past the input, and neither throws."
pubDatetime: 2026-02-26T06:00:00.000Z
tags: [correctness]
featured: true
---

An API I integrate with takes amounts as decimal strings, at a precision it sets
per field, and requires them to be floored, never rounded. Sending more than the
account holds gets rejected if you are lucky.

## The obvious version drops a step

```typescript file="serialize.ts"
const encodeAmount = (value: number, scale: number) =>
  String(Math.floor(value * 10 ** scale) / 10 ** scale);
```

This is what most people write, and it passes the tests most people write. It
fails on ordinary inputs:

```text file="repl.txt" accent
> 0.58 * 100
57.99999999999999
> Math.floor(0.58 * 100) / 100
0.57
```

The closest double to `0.58` is slightly below it, and multiplying keeps it
below. Flooring then drops a full step. Try to send a whole balance and a small
remainder is always left behind. Nothing logs an error.

## The clever version rounds up

The usual fix avoids arithmetic: format one extra digit with `toFixed`, then cut
it off.

```typescript file="serialize.ts"
const encodeAmount = (value: number, scale: number) => {
  const s = value.toFixed(scale + 1);
  const cut = s.slice(0, -1);
  return cut.endsWith(".") ? cut.slice(0, -1) : cut;
};
```

I shipped this. My reasoning was that `toFixed` only rounds the digit I throw
away. That is wrong, because rounding carries:

```text file="repl.txt" accent
> (9.99999).toFixed(3)      // scale 2
'10.000'                    // → "10.00"
> (1.2999999).toFixed(3)
'1.300'                     // → "1.30"
```

Both outputs are larger than the input. The extra digit does absorb the
representation error, which is why `0.58` now comes out right. But any value
within half a step of the next boundary gets pushed over it.

The two versions fail in opposite directions. The first leaves dust on the
account. The second asks for more than the balance you checked a moment ago.

## Cut the string instead

`String(value)` returns the shortest decimal that converts back to the same
double. For a number that came from a form field or a JSON payload, that is the
number the user typed. Truncating that string needs no arithmetic at all.

```typescript file="serialize.ts" accent
const encodeAmount = (value: number, scale: number) => {
  // Refuse instead of guessing: negatives would truncate toward zero (not a
  // floor), and from 1e21 up every formatter switches to exponent notation.
  if (!Number.isFinite(value) || value < 0 || value >= 1e21)
    throw new RangeError(`not serialisable at scale ${scale}: ${value}`);

  // Below 1e-6, String() uses exponent notation; toFixed stays plain there.
  let s = String(value);
  if (s.includes("e")) s = value.toFixed(Math.max(scale + 1, 20));

  const dot = s.indexOf(".");
  if (dot === -1) return s;
  const cut = scale === 0 ? s.slice(0, dot) : s.slice(0, dot + 1 + scale);
  return cut.includes(".") ? cut.replace(/0+$/, "").replace(/\.$/, "") : cut;
};
```

I fuzzed it over 600,000 random values at seven scales. It never returned more
than its input and never landed a full step below it. Each of the earlier
versions fails one of those two checks.

The guard clause matters as much as the cut. Every input it rejects is one where
the earlier versions returned a confident, wrong string.

## Write characterization tests first

Before changing anything, I wrote tests for the current behaviour and the
intended behaviour, and checked that exactly the expected ones failed. If
anything else fails, the contract is not what you thought, and you stop there.

That step found a bug that was not in my plan: a tidy-up that stripped trailing
zeros without first checking for a decimal point, turning `4500` into `45`. The
`cut.includes(".")` check on the last line exists because of it.

## Limits

This is float in, string out. It makes sure the last step neither gains nor
loses a unit. It is not exact arithmetic; if you sum thousands of floats before
serialising, the error happened earlier.

It also treats the shortest round-trip form as what the user meant. That is
right for values from a form or a payload. For the result of a long computation,
the extra digits are real, and you may want a different rule.

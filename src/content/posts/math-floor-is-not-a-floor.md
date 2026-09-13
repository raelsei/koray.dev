---
title: Math.floor is not a floor
description: "The obvious fix drops a step. The clever fix rounds past the input. Neither raises an exception, and only one of them spends money you don't have."
pubDatetime: 2026-02-26T06:00:00.000Z
tags: [correctness]
featured: true
---

## the missing step

A downstream system takes numeric fields as strings, at a decimal scale the
receiver supplies per field, and the value must be **floored**, never rounded.
Standard implementation:

```typescript file="serialize.ts"
const encodeAmount = (value: number, scale: number) =>
  String(Math.floor(value * 10 ** scale) / 10 ** scale);
```

Everyone writes this. It looks obviously correct. It survives the tests you would
think to write, because the inputs that break it are ordinary decimals.

```text file="repl.txt" accent
> 0.58 * 100
57.99999999999999
> Math.floor(0.58 * 100) / 100
0.57
```

The nearest double to `0.58` sits a hair below it. Multiply and it stays below.
Floor and you have dropped a whole step. Drain a balance to zero with this and it
does not reach zero; something small is left behind, and nobody finds out from a
log line.

## the guard digit, and why it isn't enough

The clever fix is to stop doing arithmetic: render one digit wider than you need,
then cut the string.

```typescript file="serialize.ts"
const encodeAmount = (value: number, scale: number) => {
  const s = value.toFixed(scale + 1);
  const cut = s.slice(0, -1);
  return cut.endsWith(".") ? cut.slice(0, -1) : cut;
};
```

I shipped this, on the reasoning that `toFixed` can only round the digit you are
about to throw away, so everything you keep is untouched.

That reasoning is wrong. Rounding the last digit **carries**.

```text file="repl.txt" accent
> (9.99999).toFixed(3)      // asking for 2 decimals
'10.000'                    // → "10.00"
> (1.2999999).toFixed(3)
'1.300'                     // → "1.30"
```

Both results are larger than the input. What this function does is round to
`scale + 1` and then truncate exactly: a floor with half a step of tolerance at
the guard position. The tolerance is genuinely useful, because it is what
absorbs the representation error and turns `0.58` back into `0.58`. It is also
not free: any value sitting within that tolerance of a boundary crosses it.

> The first version lands one step low. The second occasionally lands _high_.
> Only one of those two spends money the account does not have.

Low is a residue and an awkward support thread. High is a request for more than
the balance that was checked a moment earlier, rejected downstream if you are
lucky and filled if you are not.

## cut the string you already have

Every double has a canonical decimal form: the shortest string that round-trips
back to it. `String(value)` gives you that, and for a form field or an API
payload it is the number someone actually typed. Cutting it needs no arithmetic.

```typescript file="serialize.ts" accent
const encodeAmount = (value: number, scale: number) => {
  // Refuse rather than mangle. Negatives truncate toward zero here, which is
  // not a floor; above 1e21 every renderer switches to exponent notation.
  if (!Number.isFinite(value) || value < 0 || value >= 1e21)
    throw new RangeError(`not serialisable at scale ${scale}: ${value}`);

  // Only sub-1e-6 values still render exponentially, and toFixed is plain there.
  let s = String(value);
  if (s.includes("e")) s = value.toFixed(Math.max(scale + 1, 20));

  const dot = s.indexOf(".");
  if (dot === -1) return s;
  const cut = scale === 0 ? s.slice(0, dot) : s.slice(0, dot + 1 + scale);
  return cut.includes(".") ? cut.replace(/0+$/, "").replace(/\.$/, "") : cut;
};
```

Fuzzed over six hundred thousand values across seven scales, this never returns
a value above its input and never lands more than one step below it. Both of the
earlier versions do one or the other.

The three rejections matter more than the cut does. Each one is a case where the
previous versions produced a confident, plausible, wrong string, and the whole
argument of this post is that those are the expensive ones.

## the exemption nobody reads

The same boundary caps a different field at a fixed number of significant
figures, with a carve-out for whole numbers. Implement the headline rule, miss
the carve-out, and a round-number input is silently rewritten to a nearby
different number.

```typescript file="serialize.ts"
const encodeRate = (value: number) =>
  Number.isInteger(value)
    ? String(value)
    : trimZeros(value.toPrecision(SIG_FIGS));
```

An early return, above the rounding. Two caveats I would not have written the
first time: `toPrecision` goes exponential once the integer part outgrows the
budget, so this is only safe because values on this path are bounded well below
that, and the trailing-zero strip is the third bug in this family. On the
_amount_ path, not this one, stripping zeros without first checking for a decimal
point turned `4500` into `45`. A hundredfold error, introduced by a tidy-up,
caught in review because the diff was small enough to read.

## characterization tests first

The order matters more than the fix. Write tests that encode today's behaviour
and the intended behaviour, run them, and confirm that exactly the expected set
fails. If anything else fails, stop: the contract is not what you assumed and
everything after that is speculation. Only then change one function at a time.

That is what caught the trailing-zero bug. It was not in the audit and not in the
plan.

## when this stops working

This is float in, string out. It guarantees the last step neither loses nor gains
a step. It is not exact arithmetic, and if you are summing thousands of values
before serialising, the error you care about happened long before this function.

It also takes the shortest round-trip decimal as the intent. That is right when
the value came from a form or a payload. It is wrong when the value is the output
of a long computation, where the extra digits are real and you meant to cut them.
Same function, opposite correctness, depending on where the number has been.

_written in İstanbul, february 2026 · EOF_

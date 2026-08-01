---
title: money.ts
note: never store money as a float
description: >-
  Integer minor units and a currency tag, so the type system refuses to add
  lira to dollars and the arithmetic never drifts.
order: 1
tags: [typescript, fintech]
---

Floating point cannot represent 0.10 exactly. Add enough of them and the
rounding error surfaces on a statement, which is the one place nobody accepts
"it is only a cent".

Store the minor unit as a `bigint` and carry the currency in the type. Addition
then refuses at runtime what the compiler cannot catch — two amounts in
different currencies — and formatting stays the only place a decimal point
appears.

```typescript file="money.ts"
type Money = { minor: bigint; currency: "TRY" | "USD" | "EUR" };

const add = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) throw new Error("currency mismatch");
  return { minor: a.minor + b.minor, currency: a.currency };
};

const fmt = ({ minor, currency }: Money, locale = "tr-TR") =>
  new Intl.NumberFormat(locale, { style: "currency", currency })
    .format(Number(minor) / 100);
```

`fmt` is the only function allowed to produce a `number`. Everything upstream
of it stays integral.

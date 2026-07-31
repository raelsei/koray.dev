---
title: Turkish IBANs and the joy of boring code
description: >-
  A 200-line library, 40 test cases, and zero incidents in two years. A short
  argument for writing the unglamorous thing yourself.
pubDate: 2025-11-17
tags: [fintech, typescript, open-source]
colophon: written in İstanbul, november 2025 — EOF
---

## the smallest useful library

A Turkish IBAN is 26 characters: `TR`, two check digits, a five-digit bank code, a
reserved digit, and sixteen characters of account number. Validating one is
mod-97 arithmetic over a rearranged string. That is the entire problem.

I wrote it because every dependency I found either pulled in a country database I
did not need, or got the bank-code lookup subtly wrong for participation banks.
Two hundred lines, zero dependencies, forty test cases taken from real statements
with the digits changed.

```typescript file="iban.ts"
const mod97 = (s: string) =>
  [...s].reduce((rem, ch) => (rem * (ch >= "0" && ch <= "9" ? 10 : 100)
    + parseInt(ch, 36)) % 97, 0);

export const isValidTrIban = (input: string) => {
  const iban = input.replace(/\s+/g, "").toUpperCase();
  if (!/^TR\d{24}$/.test(iban)) return false;
  return mod97(iban.slice(4) + iban.slice(0, 4)) === 1;
};
```

## what boring bought

Two years, no incidents, three dependabot alerts — all in the test runner, none
in the library. It has been vendored into two products and copied into a third by
someone I have never met. Nobody has ever opened an issue about performance,
because there is nothing in it that could be slow.

> Every dependency must justify its own line in the lockfile. A hundred lines you
> understand beat a thousand you inherited.

## the trade, stated honestly

This is not an argument against libraries. It is an argument for knowing which
category you are in. If the problem is genuinely hard — timezones, unicode,
cryptography, PDF — take the dependency and be grateful. If the problem is a
specification you can read in an afternoon and test exhaustively, writing it
yourself is usually the cheaper option over a five-year horizon.

IBAN validation is the second kind. So is currency formatting, so is most of what
a small fintech calls "utils". The skill is telling the two apart before you
install anything.

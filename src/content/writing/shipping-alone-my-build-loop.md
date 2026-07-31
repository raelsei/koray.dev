---
title: "Shipping alone: my build loop"
description: >-
  The exact week-shape that lets one person run three products without lying to
  themselves about what got done.
pubDate: 2026-02-08
tags: [process, solo, focus]
colophon: written in İstanbul, february 2026 — EOF
---

## the failure mode

Working alone, the danger is not laziness. It is drift: four days of motion
across three products, nothing shipped, and a Friday feeling of having been very
busy. Standups exist to make drift visible. Without one, you need a shape.

## one product per day

Mine is embarrassingly simple. Each product owns whole days, never hours. Monday
and Thursday are Lumi. Tuesday is Bine. Wednesday is open source and writing.
Friday is whatever is on fire, plus the boring maintenance nobody schedules.

Context switching is not free at any granularity, but the cost is quadratic in
frequency. Two switches a week is a tax. Two switches a day is a second job.

> Days are the smallest unit of real work. Anything shorter is a meeting with
> yourself.

## the daily contract

Every working day ends with one shipped thing, defined narrowly: merged,
deployed, or published. Not "made progress on". If nothing shipped, the day is
recorded as a zero — not as punishment, but because a run of zeros is the only
honest signal that something is structurally stuck.

```text file="week.log"
mon  lumi     ship: forecast v2 behind flag
tue  bine     ship: e-invoice OCR fallback
wed  oss      ship: sse-stream 1.4.0
thu  lumi     0  — blocked on bank sandbox
fri  ops      ship: ledger reconciliation alarm
```

## the part that took longest to learn

Protecting the loop matters more than optimising it. The week only works because
nothing is allowed to claim a slot it did not earn: no standing calls, no "quick
syncs", no roadmap that spans more than six weeks. Small on purpose is not a
personality trait, it is a scheduling decision you have to keep making.

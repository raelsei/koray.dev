---
title: We chose Postgres over a queue
description: >-
  Sometimes the boring database is the whole architecture. What we replaced, what
  it cost, and the numbers two years later.
pubDate: 2025-08-02
tags: [postgres, architecture, infrastructure]
colophon: written in İstanbul, august 2025 — EOF
---

## the job we actually had

Bank sync jobs. A few thousand a day at peak, each one a minute or two of work,
each one needing at-least-once delivery, retries with backoff, and a visible
audit trail when a customer asks why their account went stale.

The reflex answer is a broker. We nearly bought one. Then we counted: a new piece
of infrastructure to run, a second consistency model to reason about, and a
transactional boundary that no longer includes the thing that triggered the job.
That last one is the expensive part — enqueueing after commit means lost jobs,
enqueueing before means phantom jobs, and both bugs are miserable to find.

## a table is a queue

```sql file="claim.sql" accent
select * from job
where status = 'pending' and run_after <= now()
order by run_after
for update skip locked
limit 10;
```

`for update skip locked` is the whole trick. Each worker claims rows nobody else
holds, without blocking, without a coordinator. The enqueue happens in the same
transaction as the business write, so a job cannot exist for a transaction that
rolled back — the failure mode that costs the most sleep simply does not exist.

> The boring database was already in the transaction. Anything else has to earn
> its way in.

## two years of numbers

Peak throughput 2.4k jobs an hour on a single `db.t4g.medium`, p95 claim latency
under 12ms, and one incident — our fault, a missing index on `run_after` after a
schema change. Retries, dead-lettering and a "why did this job fail" admin page
are all just SQL, which means support can answer their own questions.

## when this stops working

Honestly: above roughly fifty thousand jobs an hour, or when fan-out becomes the
point rather than durability. Long-lived streaming consumers want a log, not a
table. If you need ordered partitions or replay from an offset, buy the broker
and enjoy it.

We are not close to any of those lines, and the architecture diagram still fits
on one sticky note. That is worth more than most of the things I have been
tempted to add to it.

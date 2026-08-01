---
title: Idempotent writes don't make your side effects idempotent
description: >-
  The upsert is the easy half. One write with three consequences needed three
  different dedupe mechanisms, at three different layers.
pubDate: 2026-03-19
tags: [postgres, idempotency, sync]
colophon: written in İstanbul, march 2026 — EOF
---

## one write, three consequences

An offline-first client queues records and pushes them when it reconnects. The
same batch can arrive more than once — a retry, a relaunch with queued work, a
second device echoing back its own write. So the write path is an upsert keyed on
a client-minted id, and replaying it is a no-op. That part took an afternoon.

The part that took longer: the write also *causes* things. A streak advances,
points are awarded, achievements unlock, and the interface fires a celebration.
None of those are naturally idempotent, and the data layer underneath them is
designed to be replayed and to report success every time.

Idempotency is a property of a specific effect, not of an endpoint. Three
effects, three guards, three layers.

## was this row actually new?

```sql file="push.sql" accent
insert into entries (user_id, client_key, body, occurred_at)
values (...)
on conflict (user_id, client_key) do update
  set body = excluded.body, occurred_at = excluded.occurred_at
returning id, (xmax = 0) as inserted;
```

`xmax = 0` distinguishes a row that was genuinely INSERTed from one that took
the conflict branch. The caller filters on it: if nothing was new, the streak is
untouched and zero points are awarded, and the function returns early.

A pure re-sync therefore pays out nothing, and it needs no request log, no replay
table, and no idempotency-key store to know that. The database already knew which
branch it took; we were just not asking.

One thing that clause must not do is touch the tombstone column. A benign
re-push of a record the user has since deleted would otherwise resurrect it. The
delete route is the only writer of that column — this is the bug everyone who
writes `do update set (everything)` eventually ships.

## derive the event, don't emit it

Achievements are the interesting one, because the intuitive design is an event.
Cross a threshold, emit `AchievementUnlocked`, deliver it exactly once. Now you
own an exactly-once delivery problem, which is a genuinely hard problem you did
not previously have.

Instead, unlocks are never emitted. On every write the server re-derives the
complete set of achieved milestones from live facts, inserts all of them, and
reads the answer out of the write:

```sql file="milestones.sql"
insert into milestones (user_id, code) values (...)
on conflict (user_id, code) do nothing
returning code;                       -- exactly what became true just now
```

Rows that already existed are skipped by the conflict clause and do not come
back. The returned set *is* the list of things this call caused. Exactly-once
event delivery has been replaced by an idempotent upsert plus a diff.

> The write already knows what it changed. Ask it, instead of building a second
> system to be told.

Two conditions make this safe, and both are real constraints rather than
footnotes. The derivation rules must be **pure**, so re-running them is free of
consequence. And they must be **monotonic** — a rule that can become false again
would un-record an achievement, or worse, re-fire it later.

The payoff is that the system self-heals. Add a rule six months from now and it
retroactively records for existing users on their next write. No backfill job, no
migration, no one-off script that runs once and is then dead code forever.

## the animation problem

The third effect does not live in the database at all. Two overlapping pushes
produce two celebration animations, and the server correctly deduping the data
does nothing about that.

That guard is client-side: an in-flight flag that coalesces pushes at the source.
Its comment says explicitly that it exists for the animation and not for
correctness, which is the kind of note that stops someone deleting it during a
cleanup six months later.

The complementary problem is stranger. Two consecutive pushes that produce an
*identical* aggregate should still celebrate twice — and value equality swallows
the second one. So the emitted value carries a fresh id per emission purely to
trip the change observer. A deliberate inequality, for a UI that is watching for
change rather than reading state.

## when this stops working

`xmax = 0` is Postgres-specific system-column territory. It will not survive a
database port, and it is opaque to anyone who hasn't seen it before — it needs a
comment every time it appears.

Re-deriving the full fact set on every write is fine at per-user scale and would
need rethinking at volume; the cost grows with a user's history, not with the
size of the change.

And the client-side coalescing is best-effort by nature. Anything queued during
an in-flight push waits for the next flush, which is correct, and adds latency
that someone will eventually file as a bug.

---
title: "Idempotent writes don't make side effects idempotent"
description: "Making an offline-first upsert safe to replay took an afternoon. The streak, points, awards and celebration it triggers each needed their own guard."
pubDatetime: 2026-03-19T06:00:00.000Z
tags: [correctness]
---

An offline-first client queues records and pushes them when it reconnects. The
same batch can arrive more than once: a retry, an app relaunch with work still
queued, a second device. So every record carries an id minted on the client, the
server upserts on it, and replaying a batch changes nothing.

That took an afternoon. The harder part was everything the write triggers: a
streak advances, points are awarded, achievements unlock, and the app plays a
celebration. None of that is idempotent on its own, and the sync layer
underneath is built to replay and report success every time.

Idempotency belongs to each effect, not to the endpoint. Here that meant three
guards in three places.

## Did this write insert a new row?

```sql file="push.sql" accent
insert into entries (user_id, client_key, body, occurred_at)
values (...)
on conflict (user_id, client_key) do update
  set body = excluded.body, occurred_at = excluded.occurred_at
  where excluded.occurred_at > entries.occurred_at
returning id, (xmax = 0) as inserted;
```

`xmax = 0` is true only for rows that were actually inserted. If nothing in the
batch is new, the streak does not move and no points are awarded.

A few details decide whether this works:

- `xmax` has to be named explicitly. `returning *` does not include system
  columns, so an ORM that rewrites the projection silently drops the signal.
- `xmax = 0` is an implementation detail, not a documented contract. On
  Postgres 18 and later, `RETURNING` can see the old row, so use
  `(old.id is null) as inserted` instead. Either way, keep a test that fails if
  the behaviour changes.
- The `where` clause stops a stale replay from overwriting newer data. Without
  it, a client that has been offline for a day pushes its old copy over the
  server's current one. With it, a stale replay returns no row at all.
- The update must never touch the deletion marker, or re-pushing a record the
  user has since deleted brings it back. Only the delete route writes that
  column.

## Derive awards instead of emitting events

The intuitive design for achievements is an event: cross a threshold, emit
`AchievementUnlocked`, deliver it exactly once. That gives you an exactly-once
delivery problem you did not have before.

Instead, on every write the server recomputes the full set of awards the user
has earned, inserts all of them, and lets the unique index decide what is new:

```sql file="awards.sql"
insert into awards (user_id, code) values (...)
on conflict (user_id, code) do nothing
returning code;   -- only rows this statement inserted
```

Awards that already existed are skipped and not returned. What comes back is
exactly what is new.

This is safe under two conditions. The rules must be pure, so re-running them
only costs time. And they must be monotonic: once earned, an award stays earned.
A rule that can turn false again needs a way to revoke, and can fire twice.

The unique index also handles concurrency. If two requests insert the same award
at once, the second waits for the first transaction to finish. If it commits,
the second skips the row; if it rolls back, the second inserts and returns it.
Each award comes back from exactly one call.

A rule added later applies to existing users on their next write. No backfill
script.

## The celebration lives on the client

The database deduplicates the data, but two overlapping pushes still play two
celebrations. That guard has to be on the client: an in-flight flag that merges
pushes, with a comment saying it exists for the animation, not for correctness.

The reverse case happens too. Two pushes that produce the same totals should
still celebrate twice, but a UI that reacts to changes in value sees nothing new
the second time. Each result carries a fresh id so the observer fires.

## Where it broke

A multi-row `on conflict do update` cannot touch the same row twice in one
statement. Postgres raises `ON CONFLICT DO UPDATE command cannot affect row a
second time`, and an offline queue is exactly what produces duplicate keys in
one batch. I found this in production. The client now deduplicates on the
conflict key before sending. `do nothing` has no such restriction, which is why
the awards insert never hit it.

Recomputing every award on every write costs time proportional to the user's
history, not to the size of the change. At per-user scale that is fine. Merging
pushes on the client means anything queued during a push waits for the next one,
which is correct and adds a little latency.

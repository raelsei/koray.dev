---
title: Idempotent writes don't make side effects idempotent
description: >-
  The upsert was the easy half. The write also caused four other things, and none
  of them were idempotent for free.
pubDate: 2026-03-19
tags: [correctness]
colophon: written in İstanbul, march 2026 — EOF
---

## one write, three consequences

An offline-first client queues records and pushes them on reconnect. The same
batch can arrive more than once — a retry, a relaunch with queued work, a second
device echoing back its own write. So the write is an upsert keyed on a
client-minted id, and replaying it is a no-op. That part took an afternoon.

The part that took longer: the write also *causes* things. A streak advances,
points are awarded, achievements unlock, and the interface fires a celebration.
None of those are naturally idempotent, and the layer underneath them is designed
to be replayed and to report success every time.

Idempotency is a property of a specific effect, not of an endpoint. Three
effects, three guards, three layers.

## was this row actually new?

```sql file="push.sql" accent
insert into entries (user_id, client_key, body, occurred_at)
values (...)
on conflict (user_id, client_key) do update
  set body = excluded.body, occurred_at = excluded.occurred_at
  where excluded.occurred_at > entries.occurred_at
returning id, (xmax = 0) as inserted;
```

`xmax = 0` distinguishes a row that was genuinely inserted from one that took the
conflict branch. The caller filters on it: nothing new means the streak is
untouched and zero points are awarded.

Three things about that clause deserve more than the one line I originally gave
them.

It has to be named explicitly. `returning *` does not expand system columns, so
an ORM that helpfully rewrites the projection deletes the signal rather than
breaking loudly.

It is also **not a documented contract**. It works because the conflict path must
take a row lock before it can compute the updated tuple, and that lock lives in
`xmax` — an artifact of the locking implementation that has been stable for a
decade and is still nobody's promise. Postgres 18 exposes `OLD` in `RETURNING`,
which says the same thing supportably; on 18 or later, use that. Either way it
wants a comment and a test that fails loudly on a major-version upgrade.

And the `where` guard on the update is not decoration. Without it the clause is
unconditional last-write-wins, and a replayed batch is by definition old — a
retry from a client that has been offline for a day would happily overwrite newer
server state with its own stale copy.

What that clause must never touch is the tombstone column. Re-pushing a record
the user has since deleted would otherwise bring it back. The delete route is the
only writer of that column; this is the bug everyone who writes
`do update set (everything)` eventually ships.

## derive the event, don't emit it

Achievements are the interesting one, because the intuitive design is an event.
Cross a threshold, emit `AchievementUnlocked`, deliver it exactly once. Now you
own an exactly-once delivery problem, which is a genuinely hard problem you did
not previously have.

Instead, nothing is emitted. On every write the server re-derives the complete
set of earned awards from live facts, inserts all of them, and reads the answer
out of the write:

```sql file="awards.sql"
insert into awards (user_id, code) values (...)
on conflict (user_id, code) do nothing
returning code;                       -- only rows that were actually inserted
```

Rows that already existed are skipped by the conflict clause and do not come
back.

> The write already knows what it changed. Ask it, instead of building a second
> system to be told.

Two conditions make this safe. The derivation rules must be **pure**, so
re-running them costs nothing but time. And they must be **monotonic** — a rule
that can become false again would un-record an award, or worse, re-fire it later.

The payoff is that the system self-heals. Add a rule later and it retroactively
records for existing users on their next write, with no backfill job and no
one-off script that runs once and is then dead code forever.

## the animation problem

The third effect is not in the database. Two overlapping pushes produce two
celebrations, and the server correctly deduping the data does nothing about that.

That guard is client-side: an in-flight flag that coalesces pushes at the source,
with a comment saying it exists for the animation and not for correctness.

The complementary problem is stranger. Two consecutive pushes producing an
*identical* aggregate should still celebrate twice, and value equality swallows
the second. So the emitted value carries a fresh id per emission purely to trip
the change observer — a deliberate inequality, for a UI watching for change
rather than reading state.

## when this stops working

There is a trap in the batch shape that took a production replay to find. A
multi-row upsert may not affect the same existing row twice in one statement;
Postgres raises a cardinality violation rather than applying it twice. An offline
queue is precisely the thing that produces duplicate keys in one payload, so the
batch has to be deduped on the conflict key before it is sent. `do nothing`
tolerates this and `do update` does not, which is why the awards insert never hit
it and the entries insert did.

The award diff has a smaller hole. Under read-committed, `do nothing` may skip a
row conflicting with an *uncommitted* concurrent insert without waiting for it.
If that transaction rolls back, the award is neither returned nor recorded. The
next write re-derives it, so it self-heals — but it means the returned set is
"what this call recorded", not quite "what became true".

Re-deriving the full fact set on every write is fine at per-user scale, and the
cost grows with a user's history rather than with the size of their change. And
the client-side coalescing is best-effort: anything queued during an in-flight
push waits for the next flush, which is correct, and adds latency that someone
will eventually file as a bug.

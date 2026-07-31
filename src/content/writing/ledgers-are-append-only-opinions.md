---
title: Ledgers are append-only opinions
description: >-
  Why every fintech eventually writes its own ledger, and how to make peace with
  that. A balance is not a number you store; it is an argument you can replay.
pubDate: 2026-05-03
tags: [ledgers, fintech, postgres]
colophon: written in İstanbul, may 2026 — EOF
---

## the column that lies

Every payments product starts with a `balance` column. It is the obvious move:
one row per account, one number, update it on each transaction. It works until
the first concurrent write, the first partial refund, or the first support ticket
that begins "this number was different yesterday".

The column is not wrong because of a race condition. It is wrong because it
throws away the reason. A balance of 4.200,00 TRY tells you nothing about how it
got there, and when a customer disputes it you have no argument to make.

## a balance is a fold

The fix is old and boring: store the movements, derive the number.

```sql file="balance.sql"
create table entry (
  id          bigserial primary key,
  tx_id       uuid    not null,
  account_id  bigint  not null references account(id),
  amount      bigint  not null,          -- minor units, signed
  created_at  timestamptz not null default now()
);

create view balance as
select account_id, sum(amount) as minor from entry group by 1;
```

Two invariants carry the whole design. Entries are never updated or deleted — a
mistake is corrected by writing its inverse. And every transaction's entries sum
to zero, which means the system as a whole can never invent or lose money, only
move it.

> An append-only ledger is not a storage strategy. It is a promise that you will
> always be able to explain yourself.

## the part people skip

Double entry is easy to describe and easy to abandon under deadline. The pressure
always arrives the same way: a report is slow, so somebody adds a cached balance
column "just for reads". Six months later two sources of truth disagree and
nobody knows which one the mobile app reads.

Cache if you must, but make the cache obviously derived: a materialised view, a
rollup table with the entry id it was computed through, something a nightly job
can rebuild from scratch and diff. If rebuilding it is not routine, it is not a
cache — it is a second ledger you did not mean to write.

## why you will write your own

Ledger-as-a-service products exist and some are good. You will still write your
own, because a ledger encodes your product's opinions: what an account is, when
money is considered settled, how a reversal reads on a statement. Those are not
infrastructure decisions, they are product decisions wearing an infrastructure
costume.

So write it, keep it small, and let it be the most boring code in the repository.
Mine is under 900 lines of Go and has not changed shape in two years. Everything
interesting happens above it.

---
title: ledger.sql
note: entries must sum to zero
description: >-
  Append-only double entry in three objects. A balance is a fold over the
  entries, never a column somebody can update.
order: 3
tags: [sql, postgres, fintech]
---

A `balance` column is wrong the first time two writes race, and wrong again the
first time a customer disputes a number you cannot explain. Store the movements
instead and derive the total.

```sql file="ledger.sql"
create table entry (
  id          bigserial primary key,
  tx_id       uuid    not null,
  account_id  bigint  not null references account(id),
  amount      bigint  not null,          -- minor units, signed
  created_at  timestamptz not null default now()
);

create index on entry (tx_id);

-- balance is a fold, never a column
create view balance as
select account_id, sum(amount) as minor from entry group by 1;
```

Two invariants carry the design: entries are never updated or deleted — a
mistake is corrected by writing its inverse — and every `tx_id`'s entries sum to
zero, so the system can move money but never invent or lose it.

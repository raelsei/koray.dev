---
name: keel
kind: starter
order: 3
summary: SaaS starter where the architecture is enforced by the linter, not described in a document.
repo: https://github.com/raelsei/keel
lang: typescript
tags: [bun, hono, postgres]
---

Bun, Hono, Drizzle, Postgres, Better Auth, React with TanStack Router,
Turborepo, Biome. Wiring is the easy part and stays correct for about a month;
what rots is everything a README asked you to remember. So the design is not
documented, it is enforced.

**The layers are lint rules.** A `*.service.ts` cannot import `hono` or reach
the database. A module's internals are private: `@/modules/billing` resolves,
`@/modules/billing.repository` is an error. CI fails on the violation and the
message names the fix, which is the only form of documentation that survives an
agent working in the repo three months later.

**One response envelope.** Every success is `{ data }`, every failure is
`{ error: { code, message, requestId, why, fix } }`, and handlers cannot call
`c.json`, because a GritQL plugin blocks it. A thrown service error, a 404 and a happy
path all come out the same shape, so no client branches on which layer failed.
A regression test throws a Postgres URL with a password in it and asserts the
string appears nowhere in the response.

**Two API surfaces, on purpose.** `/api/*` is internal, unversioned, consumed
by a typed `hc` client, and free to change in the same commit as the component
reading it. `/v1/*` is the customer contract: versioned and the only thing in
the OpenAPI document. Both share one service and one repository, and the split
holds by construction rather than by a filter someone has to remember.

The enforcement is itself tested, because a lint rule that quietly stops
matching looks exactly like a rule that passes.

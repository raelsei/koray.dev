---
name: arcstack
kind: starter
order: 2
summary: Minimal Bun monorepo, built on workspaces and a version catalogue, no build orchestrator.
repo: https://github.com/raelsei/arcstack
lang: typescript
tags: [bun, monorepo]
---

Next.js in front, Hono on `Bun.serve()` behind, shadcn in a shared `ui`
package, and Bun's own workspaces doing the orchestration. No Turborepo, no
second build graph to keep in sync.

Shared versions are pinned once in the root `catalog`, so a bump happens in one
file and every workspace follows. `apps/*` deploy; `packages/*` are libraries
and the only workspaces the test run covers. `services/*` is deliberately
absent until something actually needs to run long.

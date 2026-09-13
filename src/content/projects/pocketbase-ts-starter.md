---
name: pocketbase-ts-starter
kind: starter
order: 1
summary: PocketBase hooks and migrations in strict TypeScript, shipped as one Docker image.
repo: https://github.com/raelsei/pocketbase-ts-starter
lang: typescript
tags: [pocketbase, docker]
---

PocketBase's JavaScript hooks are pleasant until the file is four hundred
untyped lines and a mistyped field name only surfaces at runtime. This starter
types the whole `$app` / `core.*` / `routerAdd` surface, checks it with `tsc`
and Biome, bundles it with esbuild, and packages the result as a multi-stage
Docker image.

The production defaults are the point: superuser IP allowlist, rate limiting,
and encrypted settings are on before the first deploy, not after the first
incident.

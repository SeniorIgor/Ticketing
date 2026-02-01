# Nats Library (Node.js)

Shared **backend-only nats library** for Node.js services, built with **TypeScript**, compiled with **esbuild**, and managed by **Nx**.

---

## Overview

- **Package:** `@org/nats`
- **Type:** Library
- **Scope:** Node.js backend only
- **Output:** Compiled JavaScript + type declarations
- **Used by:** Backend microservices

Frontend, browser, and framework-specific code **must not** be imported here.

---

## Commands

```bash
nx show project @org/nats      # Inspect project configuration

nx run @org/nats:build         # Build library (esbuild)
nx run @org/nats:lint          # Run ESLint
nx run @org/nats:typecheck     # Run TypeScript type-checking
nx run @org/nats:watch-deps    # Watch & rebuild dependent projects
```

---

## Usage

```ts
import { SomeUtility } from '@org/nats';
```

Nx handles build order, dependency tracking, and caching automatically.

---

## Notes

- Run all commands from the **repository root**
- **Node.js–only** (no frontend or browser APIs)
- Keep this library **small, explicit, and dependency-light**
- Shared primitives only — domain logic belongs in services

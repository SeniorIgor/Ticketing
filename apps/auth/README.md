# Auth Service (Node.js)

Authentication microservice built with **Node.js + TypeScript**, managed by **Nx**.

---

## Commands

```bash
nx show project @org/auth     # Inspect project configuration

nx run @org/auth:serve        # Run service locally
nx run @org/auth:build        # Build service (esbuild)
nx run @org/auth:test         # Run tests (jest)
nx run @org/auth:lint         # Run linting
nx run @org/auth:typecheck    # Run TypeScript type-checking
```

---

## Notes

- Run all commands from the **repository root**
- **Nx is the single source of truth** for task execution
- Build output is generated into `apps/auth/dist`
- This service may depend on **Node-only shared libraries**
- Do not import frontend (client) code

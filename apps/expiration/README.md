# expiration Service (Node.js)

expiration microservice built with **Node.js + TypeScript**, managed by **Nx**.

---

## Commands

```bash
nx show project @org/expiration  # Inspect project configuration

nx run @org/expiration:start        # Run service locally
nx run @org/expiration:build        # Build service (esbuild)
nx run @org/expiration:lint         # Run linting
nx run @org/expiration:typecheck    # Run TypeScript type-checking
```

---

## Notes

- Run all commands from the **repository root**
- **Nx is the single source of truth** for task execution
- Build output is generated into `apps/expiration/dist`
- This service may depend on **Node-only shared libraries**
- Do not import frontend (client) code

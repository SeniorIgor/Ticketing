# Orders Service (Node.js)

orders microservice built with **Node.js + TypeScript**, managed by **Nx**.

---

## Commands

```bash
nx show project @org/orders  # Inspect project configuration

nx run @org/orders:start        # Run service locally
nx run @org/orders:build        # Build service (esbuild)
nx run @org/orders:lint         # Run linting
nx run @org/orders:typecheck    # Run TypeScript type-checking
```

---

## Notes

- Run all commands from the **repository root**
- **Nx is the single source of truth** for task execution
- Build output is generated into `apps/orders/dist`
- This service may depend on **Node-only shared libraries**
- Do not import frontend (client) code

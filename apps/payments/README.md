# Payments Service (Node.js)

payments microservice built with **Node.js + TypeScript**, managed by **Nx**.

---

## Commands

```bash
nx show project @org/payments  # Inspect project configuration

nx run @org/payments:start        # Run service locally
nx run @org/payments:build        # Build service (esbuild)
nx run @org/payments:lint         # Run linting
nx run @org/payments:typecheck    # Run TypeScript type-checking
```

---

## Notes

- Run all commands from the **repository root**
- **Nx is the single source of truth** for task execution
- Build output is generated into `apps/payments/dist`
- This service may depend on **Node-only shared libraries**
- Do not import frontend (client) code

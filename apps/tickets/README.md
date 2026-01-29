# Tickets Service (Node.js)

Tickets microservice built with **Node.js + TypeScript**, managed by **Nx**.

---

## Commands

```bash
nx show project @org/tickets  # Inspect project configuration

nx run @org/tickets:start        # Run service locally
nx run @org/tickets:build        # Build service (esbuild)
nx run @org/tickets:lint         # Run linting
nx run @org/tickets:typecheck    # Run TypeScript type-checking
```

---

## Notes

- Run all commands from the **repository root**
- **Nx is the single source of truth** for task execution
- Build output is generated into `apps/tickets/dist`
- This service may depend on **Node-only shared libraries**
- Do not import frontend (client) code

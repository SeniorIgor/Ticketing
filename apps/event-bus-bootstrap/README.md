# Event-bus-bootstrap Service (Node.js)

event-bus-bootstrap microservice built with **Node.js + TypeScript**, managed by **Nx**.

---

## Commands

```bash
nx show project @org/event-bus-bootstrap  # Inspect project configuration

nx run @org/event-bus-bootstrap:start        # Run service locally
nx run @org/event-bus-bootstrap:build        # Build service (esbuild)
nx run @org/event-bus-bootstrap:lint         # Run linting
nx run @org/event-bus-bootstrap:typecheck    # Run TypeScript type-checking
```

---

## Notes

- Run all commands from the **repository root**
- **Nx is the single source of truth** for task execution
- Build output is generated into `apps/event-bus-bootstrap/dist`
- This service may depend on **Node-only shared libraries**
- Do not import frontend (client) code

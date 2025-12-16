# Client (Next.js)

Frontend application built with **Next.js**, managed by **Nx** as part of the monorepo.

---

## Commands

```bash
nx show project @org/client   # Inspect project configuration

nx run @org/client:dev        # Start dev server (next dev)
nx run @org/client:build      # Build for production
nx run @org/client:start      # Start production server
nx run @org/client:test       # Run tests (jest)
nx run @org/client:lint       # Run linting (eslint)
```

---

## Notes

- Run all commands from the **repository root**
- **Nx is the single source of truth** for task execution
- Do not run `next`, `jest`, or `eslint` directly
- This client **must not depend on backend-only shared libraries**

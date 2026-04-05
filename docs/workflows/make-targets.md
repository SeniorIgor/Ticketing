# Make targets

The Makefile is only for local operator workflows.

CI/CD should call `skaffold` and `kubectl` directly inside GitHub Actions.

## Development

- `make dev`
  Staged startup for local development: applies `dev-infra`, waits for bootstrap completion, then runs Skaffold for app services.
  Containers run compiled artifacts; file changes trigger image rebuild + redeploy (no in-container watch processes).

- `make dev-debug`
  Same staged startup as `make dev`, but keeps resources on failure for debugging.

- `make dev-stage-infra`
  Deploy only the infra phase in `ticketing-dev` (`mongo`, `redis`, `nats`, bootstrap) through Skaffold, then wait until data infra is ready and attempt bootstrap completion.
  The bootstrap job is recreated each run to avoid Kubernetes Job template immutability errors.
  In dev mode, bootstrap timeout emits diagnostics but does not abort startup.

- `make dev-down`
  Delete the entire `ticketing-dev` namespace for a clean slate.

- `make dev-clean`
  Run staged dev and automatically delete `ticketing-dev` when you stop the loop.

## Local prod-like verification

- `make prod-local-build`
  Build production Docker images locally and write Skaffold artifact metadata.

- `make prod-local-render`
  Render local prod-like infra and app manifests.

- `make prod-local-apply`
  Apply infra first, wait, then apply apps and restart them to pick up config changes.

- `make prod-local-status`
  Show deployment, statefulset, job, and pod status in `ticketing-prod`.

- `make prod-local-tail`
  Tail logs from `ticketing-prod`.

## Cloud preflight

- `make prod-cloud-render`
  Render the cloud app overlay locally, using the same production images.

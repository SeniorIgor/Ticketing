# What to implement:

1. Ensure that library available as modules and each service doesn't import the whole library.



DEV_ENV=.env.local
PROD_ENV=.env.prod

SKAFFOLD_CONFIG=infra/skaffold.yaml

ensure-dev-ns:
	kubectl get ns ticketing-dev >/dev/null 2>&1 || kubectl create ns ticketing-dev

dev-secrets: ensure-dev-ns
	@test -f $(DEV_ENV) || (echo "$(DEV_ENV) not found" && exit 1)
	kubectl -n ticketing-dev create secret generic app-secret \
	  --from-env-file=$(DEV_ENV) \
	  --dry-run=client -o yaml \
	  | kubectl apply -f -

# COPY TLS FROM default -> ticketing-dev (idempotent)
dev-tls: ensure-dev-ns
	kubectl get secret ticketing-tls -n default -o yaml \
	  | sed 's/namespace: default/namespace: ticketing-dev/' \
	  | kubectl apply -f -

dev: dev-secrets dev-tls
	skaffold dev -f $(SKAFFOLD_CONFIG) --cleanup=false
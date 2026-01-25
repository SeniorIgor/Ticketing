DEV_ENV=.env.local
PROD_ENV=.env.prod

SKAFFOLD_CONFIG=infra/skaffold.yaml

ensure-dev-ns:
	kubectl get ns ticketing-dev >/dev/null 2>&1 || kubectl create ns ticketing-dev

ensure-prod-ns:
	kubectl get ns ticketing-prod >/dev/null 2>&1 || kubectl create ns ticketing-prod

dev-secrets: ensure-dev-ns
	@test -f $(DEV_ENV) || (echo "$(DEV_ENV) not found" && exit 1)
	kubectl -n ticketing-dev create secret generic app-secret \
	  --from-env-file=$(DEV_ENV) \
	  --dry-run=client -o yaml \
	  | kubectl apply -f -

prod-secrets: ensure-prod-ns
	@test -f $(PROD_ENV) || (echo "$(PROD_ENV) not found" && exit 1)
	kubectl -n ticketing-prod create secret generic app-secret \
	  --from-env-file=$(PROD_ENV) \
	  --dry-run=client -o yaml \
	  | kubectl apply -f -

dev-tls: ensure-dev-ns
	kubectl get secret ticketing-tls -n default -o yaml \
	  | sed 's/namespace: default/namespace: ticketing-dev/' \
	  | kubectl apply -f -

dev: dev-secrets
	skaffold dev -f $(SKAFFOLD_CONFIG)

prod: prod-secrets
	skaffold run -f $(SKAFFOLD_CONFIG) -p prod

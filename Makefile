DEV_ENV=.env.local
PROD_ENV=.env.prod

dev-secrets:
	@test -f $(DEV_ENV) || (echo "$(DEV_ENV) not found" && exit 1)
	kubectl create secret generic app-secret \
	  --from-env-file=$(DEV_ENV) \
	  --dry-run=client -o yaml \
	  | kubectl apply -f -

prod-secrets:
	@test -f $(PROD_ENV) || (echo "$(PROD_ENV) not found" && exit 1)
	kubectl create secret generic app-secret \
	  --from-env-file=$(PROD_ENV) \
	  --dry-run=client -o yaml \
	  | kubectl apply -f -

dev: dev-secrets
	skaffold dev

prod: prod-secrets
	skaffold run -p prod

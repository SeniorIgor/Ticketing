DEV_ENV=.env.local
PROD_ENV=.env.prod

SKAFFOLD_CONFIG=infra/skaffold.yaml
SKAFFOLD_STATE_DIR=.skaffold
TLS_HOST=ticketing.dev
SECRET_KEYS=JWT_SECRET REDIS_PASSWORD STRIPE_SECRET_KEY NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
INFRA_DEPLOYMENTS=auth-mongo-depl orders-mongo-depl payments-mongo-depl tickets-mongo-depl
APP_DEPLOYMENTS=auth-depl client-depl client-gateway expiration-depl orders-depl payments-depl tickets-depl
STATEFULSETS=nats redis
PROD_LOCAL_BUILD_PROFILE=prod-images
PROD_ARTIFACTS=$(SKAFFOLD_STATE_DIR)/prod-artifacts.json
PROD_RENDERED_INFRA=$(SKAFFOLD_STATE_DIR)/prod-infra.rendered.yaml
PROD_RENDERED_APP=$(SKAFFOLD_STATE_DIR)/prod-app.rendered.yaml
PROD_RENDERED_CLOUD_APP=$(SKAFFOLD_STATE_DIR)/prod-cloud-app.rendered.yaml
DEV_SECRETS_FILE=infra/k8s/apps/ticketing/overlays/dev-common/secrets.generated.env
PROD_SECRETS_FILE=infra/k8s/apps/ticketing/overlays/prod-common/secrets.generated.env
DEV_TLS_DIR=infra/k8s/apps/ticketing/overlays/dev/.tls
DEV_TLS_CERT=$(DEV_TLS_DIR)/ticketing.dev.crt
DEV_TLS_KEY=$(DEV_TLS_DIR)/ticketing.dev.key
PROD_TLS_DIR=infra/k8s/apps/ticketing/overlays/prod-common/.tls
PROD_TLS_CERT=$(PROD_TLS_DIR)/ticketing.dev.crt
PROD_TLS_KEY=$(PROD_TLS_DIR)/ticketing.dev.key

# Local operator commands only. CI/CD should call Skaffold and kubectl directly.
.PHONY: \
	ensure-dev-ns ensure-prod-ns \
	dev-secrets-local dev-tls-local dev-tls-reset dev-wait-infra dev-stage-infra dev dev-debug dev-tail-gateway dev-tail-gateway-raw dev-tail-services dev-down dev-clean \
	prod-local-secrets prod-tls-local prod-tls-reset \
	prod-local-build prod-local-render prod-local-wait-infra prod-local-wait-app prod-local-restart-app prod-local-apply prod-local-status prod-local-down prod-local-stop prod-local-start prod-local-tail \
	prod-cloud-render \
	prod-cluster-app-secret prod-cluster-ghcr-creds \
	prod-argocd-install prod-argocd-apps prod-argocd-status

# Namespace setup
ensure-dev-ns:
	kubectl get ns ticketing-dev >/dev/null 2>&1 || kubectl create ns ticketing-dev

ensure-prod-ns:
	kubectl get ns ticketing-prod >/dev/null 2>&1 || kubectl create ns ticketing-prod

# Local development
dev-secrets-local:
	mkdir -p $(dir $(DEV_SECRETS_FILE))
	test -f $(DEV_ENV) || { echo "Missing $(DEV_ENV). Copy .env.local.example to $(DEV_ENV) and fill in values."; exit 1; }
	for key in $(SECRET_KEYS); do \
		grep -q "^$$key=" $(DEV_ENV) || { echo "Missing $$key in $(DEV_ENV)"; exit 1; }; \
	done
	cp $(DEV_ENV) $(DEV_SECRETS_FILE)

# Create or refresh the local TLS secret for the dev namespace.
dev-tls-local: ensure-dev-ns
	mkdir -p $(DEV_TLS_DIR)
	if ! test -f $(DEV_TLS_CERT) || ! test -f $(DEV_TLS_KEY); then \
		if command -v mkcert >/dev/null 2>&1; then \
			mkcert -cert-file $(DEV_TLS_CERT) -key-file $(DEV_TLS_KEY) $(TLS_HOST); \
		else \
			openssl req -x509 -nodes -newkey rsa:2048 -keyout $(DEV_TLS_KEY) -out $(DEV_TLS_CERT) -days 365 -subj "/CN=$(TLS_HOST)" -addext "subjectAltName=DNS:$(TLS_HOST)"; \
		fi; \
	fi
	kubectl create secret tls ticketing-tls -n ticketing-dev --cert=$(DEV_TLS_CERT) --key=$(DEV_TLS_KEY) --dry-run=client -o yaml | kubectl apply -f -

dev-tls-reset:
	rm -f $(DEV_TLS_CERT) $(DEV_TLS_KEY)

# Prepare ignored prod-like secrets for local verification.
prod-local-secrets:
	mkdir -p $(dir $(PROD_SECRETS_FILE))
	test -f $(PROD_ENV) || { echo "Missing $(PROD_ENV). Copy .env.prod.example to $(PROD_ENV) and fill in values."; exit 1; }
	for key in $(SECRET_KEYS); do \
		grep -q "^$$key=" $(PROD_ENV) || { echo "Missing $$key in $(PROD_ENV)"; exit 1; }; \
	done
	cp $(PROD_ENV) $(PROD_SECRETS_FILE)

# Create or refresh the local TLS secret for the prod-like namespace.
prod-tls-local: ensure-prod-ns
	mkdir -p $(PROD_TLS_DIR)
	if ! test -f $(PROD_TLS_CERT) || ! test -f $(PROD_TLS_KEY); then \
		if command -v mkcert >/dev/null 2>&1; then \
			mkcert -cert-file $(PROD_TLS_CERT) -key-file $(PROD_TLS_KEY) $(TLS_HOST); \
		else \
			openssl req -x509 -nodes -newkey rsa:2048 -keyout $(PROD_TLS_KEY) -out $(PROD_TLS_CERT) -days 365 -subj "/CN=$(TLS_HOST)" -addext "subjectAltName=DNS:$(TLS_HOST)"; \
		fi; \
	fi
	kubectl create secret tls ticketing-tls -n ticketing-prod --cert=$(PROD_TLS_CERT) --key=$(PROD_TLS_KEY) --dry-run=client -o yaml | kubectl apply -f -

prod-tls-reset:
	rm -f $(PROD_TLS_CERT) $(PROD_TLS_KEY)

dev-wait-infra:
	kubectl wait -n ticketing-dev --for=condition=available $(foreach deployment,$(INFRA_DEPLOYMENTS),deployment/$(deployment)) --timeout=180s
	for statefulset in $(STATEFULSETS); do \
		kubectl rollout status statefulset/$$statefulset -n ticketing-dev --timeout=180s; \
	done
	kubectl wait job/event-bus-bootstrap -n ticketing-dev --for=condition=complete --timeout=300s || { \
		echo "[warn] event-bus-bootstrap did not complete in time; continuing dev startup"; \
		kubectl get jobs -n ticketing-dev event-bus-bootstrap || true; \
		kubectl get pods -n ticketing-dev -l app=event-bus-bootstrap || true; \
		kubectl logs -n ticketing-dev -l app=event-bus-bootstrap --tail=80 || true; \
	}

dev-stage-infra: ensure-dev-ns dev-secrets-local dev-tls-local
	kubectl delete job/event-bus-bootstrap -n ticketing-dev --ignore-not-found
	skaffold run -f $(SKAFFOLD_CONFIG) -p dev-infra --status-check=false
	$(MAKE) dev-wait-infra

dev: dev-stage-infra
	skaffold dev -f $(SKAFFOLD_CONFIG) --tail

# Development mode that suspends on failure so pods can be inspected.
dev-debug: dev-stage-infra
	skaffold dev -f $(SKAFFOLD_CONFIG) --keep-running-on-failure=true --cleanup=false --tail

# Tail Kong gateway logs (clean view): hides internal Kong worker-event noise.
dev-tail-gateway:
	@if command -v stern >/dev/null 2>&1; then \
		stern -n ticketing-dev '^client-gateway-.*' --container kong --since 2m --template '{{.Message}}' \
			| grep -Ev 'kong_worker_events|acme renew timer started|signal 29 \(SIGIO\)|client closed connection while waiting for request'; \
	else \
		kubectl logs -n ticketing-dev deploy/client-gateway -f --since=2m \
			| grep -Ev 'kong_worker_events|acme renew timer started|signal 29 \(SIGIO\)|client closed connection while waiting for request'; \
	fi

# Tail full raw Kong gateway logs (no filtering).
dev-tail-gateway-raw:
	kubectl logs -n ticketing-dev deploy/client-gateway -f --since=2m

# Remove the entire dev namespace for a fully clean restart.
dev-down:
	kubectl delete ns ticketing-dev --ignore-not-found

# Ephemeral dev: run staged dev and always delete dev namespace on exit.
dev-clean: dev-stage-infra
	sh -c 'trap "kubectl delete ns ticketing-dev --ignore-not-found >/dev/null 2>&1 || true" EXIT INT TERM; skaffold dev -f $(SKAFFOLD_CONFIG)' --tail

# Local prod-like verification
prod-local-build: prod-local-secrets
	mkdir -p $(SKAFFOLD_STATE_DIR)
	skaffold build -f $(SKAFFOLD_CONFIG) -p $(PROD_LOCAL_BUILD_PROFILE) --file-output=$(PROD_ARTIFACTS)

prod-local-render: prod-local-build
	skaffold render -f $(SKAFFOLD_CONFIG) -p $(PROD_LOCAL_BUILD_PROFILE),prod-infra -a $(PROD_ARTIFACTS) --output=$(PROD_RENDERED_INFRA)
	skaffold render -f $(SKAFFOLD_CONFIG) -p $(PROD_LOCAL_BUILD_PROFILE),prod-app -a $(PROD_ARTIFACTS) --output=$(PROD_RENDERED_APP)

# Cloud preflight render
prod-cloud-render: prod-local-build
	skaffold render -f $(SKAFFOLD_CONFIG) -p $(PROD_LOCAL_BUILD_PROFILE),prod-infra -a $(PROD_ARTIFACTS) --output=$(PROD_RENDERED_INFRA)
	skaffold render -f $(SKAFFOLD_CONFIG) -p $(PROD_LOCAL_BUILD_PROFILE),prod-cloud-app -a $(PROD_ARTIFACTS) --output=$(PROD_RENDERED_CLOUD_APP)

# Create or update the in-cluster production app secret from the ignored .env.prod file.
prod-cluster-app-secret: ensure-prod-ns
	test -f $(PROD_ENV) || { echo "Missing $(PROD_ENV). Copy .env.prod.example to $(PROD_ENV) and fill in values."; exit 1; }
	for key in $(SECRET_KEYS); do \
		grep -q "^$$key=" $(PROD_ENV) || { echo "Missing $$key in $(PROD_ENV)"; exit 1; }; \
	done
	kubectl create secret generic app-secret -n ticketing-prod --from-env-file=$(PROD_ENV) --dry-run=client -o yaml | kubectl apply -f -

# Create or update the in-cluster GHCR pull secret.
# Usage:
#   GHCR_USERNAME=SeniorIgor GHCR_PAT=... GHCR_EMAIL=you@example.com make prod-cluster-ghcr-creds
prod-cluster-ghcr-creds: ensure-prod-ns
	test -n "$$GHCR_USERNAME" || { echo "Missing GHCR_USERNAME"; exit 1; }
	test -n "$$GHCR_PAT" || { echo "Missing GHCR_PAT"; exit 1; }
	test -n "$$GHCR_EMAIL" || { echo "Missing GHCR_EMAIL"; exit 1; }
	kubectl create secret docker-registry ghcr-creds \
		-n ticketing-prod \
		--docker-server=ghcr.io \
		--docker-username="$$GHCR_USERNAME" \
		--docker-password="$$GHCR_PAT" \
		--docker-email="$$GHCR_EMAIL" \
		--dry-run=client -o yaml | kubectl apply -f -

# Install Argo CD into the cluster.
prod-argocd-install:
	kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
	kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply the Argo CD Applications defined in this repo.
prod-argocd-apps:
	kubectl apply -k infra/argocd

# Quick Argo CD health check.
prod-argocd-status:
	kubectl get pods -n argocd
	kubectl get applications -n argocd

# Wait until the infra phase is actually usable before the app phase starts.
prod-local-wait-infra:
	kubectl wait -n ticketing-prod --for=condition=available $(foreach deployment,$(INFRA_DEPLOYMENTS),deployment/$(deployment)) --timeout=180s
	for statefulset in $(STATEFULSETS); do \
		kubectl rollout status statefulset/$$statefulset -n ticketing-prod --timeout=180s; \
	done
	kubectl wait job/event-bus-bootstrap -n ticketing-prod --for=condition=complete --timeout=120s

# Wait until the app phase is ready before considering the rollout complete.
prod-local-wait-app:
	kubectl wait -n ticketing-prod --for=condition=available $(foreach deployment,$(APP_DEPLOYMENTS),deployment/$(deployment)) --timeout=180s

# Restart app deployments so Secret and ConfigMap changes are picked up.
prod-local-restart-app:
	kubectl rollout restart -n ticketing-prod $(foreach deployment,$(APP_DEPLOYMENTS),deployment/$(deployment))

# Full local prod-like rollout: infra first, then app phase.
prod-local-apply: ensure-prod-ns prod-tls-local prod-local-render
	kubectl delete job/event-bus-bootstrap -n ticketing-prod --ignore-not-found
	kubectl apply -f $(PROD_RENDERED_INFRA)
	$(MAKE) prod-local-wait-infra
	kubectl apply -f $(PROD_RENDERED_APP)
	$(MAKE) prod-local-restart-app
	$(MAKE) prod-local-wait-app

prod-local-status:
	kubectl get deploy,statefulset,job,pods -n ticketing-prod

prod-local-down:
	kubectl delete ns ticketing-prod --ignore-not-found

prod-local-stop:
	kubectl scale deploy -n ticketing-prod --all --replicas=0 || true
	kubectl scale statefulset -n ticketing-prod --all --replicas=0 || true

prod-local-start:
	kubectl scale statefulset -n ticketing-prod --all --replicas=1 || true
	kubectl scale deploy -n ticketing-prod --all --replicas=1 || true

# Tail local prod-like logs.
prod-local-tail:
	stern -n ticketing-prod .

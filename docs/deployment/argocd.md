# Argo CD setup

Use Argo CD for continuous delivery inside the cluster.

Recommended model for this repository:

- GitHub-hosted Actions build and push immutable images to GHCR
- GitHub-hosted Actions render the production GitOps snapshot into `infra/gitops/production`
- Argo CD watches that path and reconciles the cluster

Official docs:

- https://argo-cd.readthedocs.io/en/stable/operator-manual/installation/
- https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/

## 1) Install Argo CD in the cluster

```bash
make prod-argocd-install
make prod-argocd-status
```

Wait until the Argo CD pods are `Running`.

## 2) Apply the Argo CD Applications from this repo

This repository includes two Argo CD `Application` resources:

- [ticketing-prod-infra.application.yaml](/Users/user/Drafts/personal/Microservices%20Udemy%20Course/ticketing/infra/argocd/ticketing-prod-infra.application.yaml)
- [ticketing-prod-app.application.yaml](/Users/user/Drafts/personal/Microservices%20Udemy%20Course/ticketing/infra/argocd/ticketing-prod-app.application.yaml)

Apply them with:

```bash
make prod-argocd-apps
make prod-argocd-status
```

## 3) One-time cluster secrets

These are still created manually and remain only in the cluster:

- `ghcr-creds`
- `app-secret`

Create or update them in `ticketing-prod`.

### `ghcr-creds`

```bash
GHCR_USERNAME=YOUR_GITHUB_USERNAME \
GHCR_PAT=YOUR_GHCR_PAT \
GHCR_EMAIL=YOUR_EMAIL \
make prod-cluster-ghcr-creds
```

### `app-secret`

```bash
make prod-cluster-app-secret
```

That target reads the ignored `.env.prod` file and creates or updates the `app-secret` Kubernetes Secret.

The `default` service account is now declared in Git and references `ghcr-creds`, so the image pull behavior is no longer hidden manual state.

## 4) Release flow

Run the GitHub Actions workflow:

- [deploy-cloud.yml](/Users/user/Drafts/personal/Microservices%20Udemy%20Course/ticketing/.github/workflows/deploy-cloud.yml)

Before the first release, set this repository variable:

- `PRODUCTION_HOSTNAME=ticketing-online.cloud`

It will:

1. build and push immutable production images to GHCR
2. render `prod-gitops-infra` and `prod-gitops-cloud-app`
3. commit the generated YAML into `infra/gitops/production`
4. push that commit back to the repository

Argo CD then detects the Git change and syncs the cluster.

## 5) Initial bootstrap order

For the first setup:

1. install `ingress-nginx`
2. install `cert-manager`
3. apply the `ClusterIssuer`
4. create `ghcr-creds`
5. create `app-secret`
6. install Argo CD
7. apply `infra/argocd`
8. run the `Deploy Cloud` workflow once

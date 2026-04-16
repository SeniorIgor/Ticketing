# GitHub secrets checklist

## Repository secrets

For the current GitOps production release workflow:

- no custom repository secrets are required
- no custom repository variables are required

## How values are used

- no registry secrets are required when publishing to GHCR from GitHub Actions with `GITHUB_TOKEN`
- `GITHUB_TOKEN`: authenticates the release workflow to GHCR and lets it commit the generated GitOps snapshot back to the repository

## One-time cluster secrets still required

Before Argo CD can reconcile production successfully, the cluster still needs:

- `ingress-nginx`
- `cert-manager`
- the `ghcr-creds` image pull secret in `ticketing-prod`
- the `app-secret` Kubernetes secret in `ticketing-prod`

These stay in the cluster and are not stored in Git.

Recommended next step later:

- replace manual cluster secrets with SOPS, Sealed Secrets, or External Secrets

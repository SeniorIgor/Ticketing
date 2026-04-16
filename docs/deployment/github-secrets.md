# GitHub secrets checklist

## Repository Secrets

Cloud deploy:

- `KUBE_CONFIG_B64`
- `JWT_SECRET_PROD`
- `REDIS_PASSWORD_PROD`
- `STRIPE_SECRET_KEY_PROD`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD`

## Repository Variables

- `LETSENCRYPT_EMAIL`

## How values are used

- no registry secrets are required when publishing to GHCR from GitHub Actions with `GITHUB_TOKEN`
- `KUBE_CONFIG_B64`: authenticate GitHub Actions to the cluster
- `*_PROD`: generate `infra/k8s/apps/ticketing/overlays/prod-common/secrets.generated.env` at deploy time
- `LETSENCRYPT_EMAIL`: injected into the cert-manager `ClusterIssuer`

## How to create `KUBE_CONFIG_B64`

```bash
kubectl config view --raw | base64
```

Use the single-line output as the GitHub Secret value.

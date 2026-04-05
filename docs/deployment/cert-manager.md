# cert-manager install

Official docs:
- https://cert-manager.io/docs/installation/helm/

## 1) Install cert-manager

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

## 2) Apply the ClusterIssuer

Manifest:
- `infra/k8s/addons/cert-manager/clusterissuer-letsencrypt.yaml`

If you deploy through GitHub Actions, the workflow injects the email at runtime.

For manual deploys, edit the email first, then apply:

```bash
kubectl apply -f infra/k8s/addons/cert-manager/clusterissuer-letsencrypt.yaml
```

## 3) Apply the app ingress with TLS

For manual cloud deploys, update the hostname in:
- `infra/k8s/apps/ticketing/overlays/prod-cloud-app/ingress-cloud.yaml`

Then deploy:

```bash
kubectl apply -k infra/k8s/apps/ticketing/overlays/prod-infra
kubectl wait job/event-bus-bootstrap -n ticketing-prod --for=condition=complete --timeout=120s
kubectl apply -k infra/k8s/apps/ticketing/overlays/prod-cloud-app
```

## 4) Verify

```bash
kubectl get pods -n cert-manager
kubectl get clusterissuer
kubectl get certificate -A
kubectl get challenge -A
```

## 5) Notes

- This assumes `ingress-nginx` is installed.
- Let’s Encrypt HTTP-01 needs a real public hostname that resolves to your ingress and reachable ports `80/443`.

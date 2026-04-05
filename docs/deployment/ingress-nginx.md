# ingress-nginx install

Official docs:
- https://kubernetes.github.io/ingress-nginx/deploy/

## Install

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  -f infra/k8s/addons/ingress-nginx/values.yaml
```

## Verify

```bash
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
kubectl get ingressclass
```

## Notes

- The current values use `LoadBalancer`, which is right for cloud clusters.
- In local clusters like Docker Desktop, you may still see routing through `localhost`.

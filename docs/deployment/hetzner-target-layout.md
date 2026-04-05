# Hetzner target layout

Hetzner Cloud is a good low-cost place to practice a real deployment flow, but it is not a managed Kubernetes service.

That means:

- you still get real cloud VMs, private networking, load balancers, volumes, DNS, and CI/CD
- you do **not** get a managed Kubernetes control plane like EKS/GKE/AKS
- you will run and maintain the Kubernetes cluster yourself

## Cheapest practical learning setup

For this project, the cheapest setup that still teaches the right concepts is:

- 1 Hetzner Cloud project
- 1 private network
- 3 small cloud servers
  - 1 control-plane node
  - 2 worker nodes
- 1 Hetzner Load Balancer
- 1 or more volumes for stateful workloads
- 1 real domain managed in any DNS provider

## Why not a single-node cluster

You can run Kubernetes on one node more cheaply, but you lose too much:

- no realistic scheduler behavior
- no node failure practice
- weaker ingress and storage testing
- less realistic rollout behavior

So for learning, 3 small nodes is the better minimum.

## Recommended stack on Hetzner

- Ubuntu on the servers
- `k3s` for Kubernetes
- `ingress-nginx`
- `cert-manager`
- Longhorn or Hetzner-attached volumes, depending on how deep you want to go on storage
- GitHub Actions for CI/CD

## Why `k3s`

`k3s` is the pragmatic choice here:

- simpler than kubeadm
- still real Kubernetes
- widely used for small clusters
- easier to learn cluster operations on a budget

## Approximate cost shape

Official Hetzner pricing currently shows low-end cloud servers starting around `€4.49/month` after the April 1, 2026 price adjustment, and the smallest load balancer at `€7.49/month` in Germany/Finland:

- [Hetzner price adjustment](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/)
- [Hetzner load balancer pricing](https://www.hetzner.com/cloud/load-balancer/)

So the rough baseline is:

- 3 small servers: roughly `€13.47/month` before VAT if you use the smallest tier
- 1 load balancer: roughly `€7.49/month` before VAT
- plus volumes, snapshots, and traffic beyond included limits if applicable

That is much cheaper than a managed control plane setup, but you are paying with more operational work.

## Best learning recommendation

If your goal is:

- cheapest path
- real CI/CD
- real ingress
- real TLS
- real Kubernetes

then Hetzner + `k3s` is a strong choice.

If your goal later becomes:

- managed Kubernetes control plane
- less cluster maintenance
- closer to enterprise managed-cloud patterns

then move to EKS, GKE, or AKS after you are comfortable with the deployment pipeline.

# What to implement:

1. Ensure that library support tree-shaking and each service doesn't import the whole library.
2. Add pagination in tickets and orders service similarly to payment service
3. Filter only available tickets (do not show complete or reserved tickets on the main page)
4. Fix concurrency issue when order created twice
5. Create production build and test

---

CI/CD
Still needed:
image registry push for CI/CD
immutable image tags
real production secret management
real domain + DNS
real cluster / cloud account
---

What you need next:

Open the cloud account and create the Kubernetes cluster.
Buy or choose the real domain and point DNS to the ingress.
Install ingress-nginx and cert-manager in the cluster.
Add GitHub Secrets:
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
KUBE_CONFIG_B64
JWT_SECRET_PROD
REDIS_PASSWORD_PROD
STRIPE_SECRET_KEY_PROD
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD
Add GitHub Variable:
LETSENCRYPT_EMAIL
Run Release Images, then Deploy Cloud with your hostname.


---

✅ Best for learning + correctness: store a TLS secret manifest (or sealed) and let Skaffold apply it
	•	Put the secret YAML in infra/k8s/prod/secret-tls.yaml (or use SOPS/SealedSecrets)
	•	Then it’s applied in the prod profile automatically.

Let's do so

⚙️ What Is Missing For True Production

Since you’re building toward real software architecture (and you want production-grade thinking), you are missing:
	•	Image registry push config
	•	Immutable image tags
	•	Readiness/liveness probes validation
	•	HPA
	•	Resource limits enforcement
	•	NetworkPolicies
	•	PodDisruptionBudget
	•	Secret management (not copying from default)

5️⃣ What matters most for becoming a software architect
1 Distributed systems
2 Cloud architecture
3 Containers
4 Kubernetes fundamentals
5 Infrastructure as Code
6 Observability
7 CI/CD

6️⃣ What your real learning project should include
Docker
Kubernetes
Ingress
NATS
Redis
Mongo
Prometheus
Grafana
CI/CD

7️⃣ The best learning path
1 Learn Docker deeply
2 Learn basic cloud networking concepts
3 Run Kubernetes locally (k3d)
4 Deploy your microservices locally
5 Add monitoring (Prometheus + Grafana)
6 Move cluster to cheap cloud server (Hetzner)
7 Deploy services with Helm or Kustomize
8 Learn Infrastructure as Code (Terraform)
9 Add CI/CD pipeline (GitHub Actions)
10 Study AWS fundamentals
11 Deploy system to AWS (EKS or ECS)
12 Prepare for AWS certification


// Memory and CPU Check
kubectl get events -n ticketing-dev --sort-by=.lastTimestamp | tail -50
docker stats
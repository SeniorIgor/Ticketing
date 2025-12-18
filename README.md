# Ticketing App

This repository contains the **Ticketing App**, a microservices-based application running on Kubernetes with an NGINX Ingress.
It supports local development using **Skaffold**, **Docker Desktop Kubernetes**, and **HTTPS via mkcert**.

---

## 🚀 Prerequisites

Make sure you have the following installed:

- Docker Desktop (with Kubernetes enabled)
- kubectl
- Skaffold
- Node.js (for local development if needed)
- Homebrew (macOS)

---

## 🔐 Running the Ticketing App locally with HTTPS

To run the application in your **local Kubernetes cluster** with HTTPS, you need to configure local DNS and a trusted TLS certificate.

---

### 1️⃣ Map the domain to localhost

Add a local DNS entry so `ticketing.dev` points to your machine.

**macOS:**

```bash
sudo nano /etc/hosts
```

Add the following line:

```text
127.0.0.1 ticketing.dev
```

This allows your browser to resolve `https://ticketing.dev` to the local cluster.

---

### 2️⃣ Install mkcert (recommended for local HTTPS)

We use **mkcert**, the industry-standard tool for generating locally trusted certificates.

```bash
brew install mkcert
mkcert -install
```

---

### 3️⃣ Generate a TLS certificate for `ticketing.dev`

```bash
mkcert ticketing.dev
```

This will generate two files:

```text
ticketing.dev.pem
ticketing.dev-key.pem
```

These certificates are trusted by your local OS and browser.

---

### 4️⃣ Create a Kubernetes TLS secret

Create a TLS secret in Kubernetes using the generated certificate:

```bash
kubectl create secret tls ticketing-tls \
  --cert=ticketing.dev.pem \
  --key=ticketing.dev-key.pem
```

Verify the secret was created:

```bash
kubectl get secret ticketing-tls
```

---

### 5️⃣ Reference the TLS secret in Ingress

Make sure your Ingress configuration includes the TLS section:

```yaml
spec:
  tls:
    - hosts:
        - ticketing.dev
      secretName: ticketing-tls
```

Once applied, your app will be available at:

```
https://ticketing.dev
```

without browser security warnings.

---

## ▶️ Running the app with Skaffold

From the project root, run:

```bash
skaffold dev
```

Skaffold will:

- Build Docker images
- Deploy manifests to Kubernetes
- Watch for file changes and redeploy automatically

---

## 🛠 Troubleshooting

### Browser shows a security warning

- Ensure `mkcert -install` was executed
- Ensure the `ticketing-tls` secret exists
- Verify Ingress references the correct TLS secret

### App not reachable

- Check Ingress controller:
  ```bash
  kubectl get pods -n ingress-nginx
  ```
- Describe ingress:
  ```bash
  kubectl describe ingress ingress-srv
  ```

---

## 📝 Notes

- For simple local development, HTTP can be used instead of HTTPS.
- HTTPS is recommended to better match production behavior.

---

Happy hacking! 🚀

# ---------- Builder ----------
FROM node:24-alpine AS builder

WORKDIR /app

# Workspace metadata
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

# Per-project manifests for dependency graph
COPY apps/payments/package.json apps/payments/
COPY packages/core/package.json packages/core/
COPY packages/nats/package.json packages/nats/
COPY packages/contracts/package.json packages/contracts/

RUN npm i

# Copy source code needed for build
COPY apps/payments ./apps/payments
COPY packages/core ./packages/core
COPY packages/nats ./packages/nats
COPY packages/contracts ./packages/contracts

# Build payments (bundles core)
RUN npx nx build payments

# ---------- Runtime ----------
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/payments/dist ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 80

CMD ["node", "index.cjs"]

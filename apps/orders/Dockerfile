# ---------- Builder ----------
FROM node:24-alpine AS builder

WORKDIR /app

# Workspace metadata
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

# Per-project manifests for dependency graph
COPY apps/orders/package.json apps/orders/
COPY packages/core/package.json packages/core/
COPY packages/nats/package.json packages/nats/
COPY packages/contracts/package.json packages/contracts/

RUN npm i

# Copy source code needed for build
COPY apps/orders ./apps/orders
COPY packages/core ./packages/core
COPY packages/nats ./packages/nats
COPY packages/contracts ./packages/contracts

# Build orders (bundles core)
RUN npx nx build orders

# ---------- Runtime ----------
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/orders/dist ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 80

CMD ["node", "index.cjs"]

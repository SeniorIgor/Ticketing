# ---------- Builder ----------
FROM node:24.11.1-slim AS builder

WORKDIR /app

RUN npm i -g npm@11.6.2

# Workspace metadata
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

# Per-project manifests for dependency graph
COPY apps/event-bus-bootstrap/package.json apps/event-bus-bootstrap/
COPY packages/nats/package.json packages/nats/
COPY packages/core/package.json packages/core/
COPY packages/contracts/package.json packages/contracts/

ENV HUSKY=0
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source code needed for build
COPY apps/event-bus-bootstrap ./apps/event-bus-bootstrap
COPY packages/nats ./packages/nats
COPY packages/core ./packages/core
COPY packages/contracts ./packages/contracts

# Build (bundles deps)
RUN npx nx build event-bus-bootstrap
RUN npm prune --omit=dev

# ---------- Runtime ----------
FROM node:24.11.1-slim

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/event-bus-bootstrap/dist ./
COPY --from=builder /app/node_modules ./node_modules

USER node

CMD ["node", "index.cjs"]
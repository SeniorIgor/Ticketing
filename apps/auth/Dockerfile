# ---------- Builder ----------
FROM node:24.11.1-slim AS builder

WORKDIR /app

RUN npm i -g npm@11.6.2

# Workspace metadata
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

# Per-project manifests for dependency graph
COPY apps/auth/package.json apps/auth/
COPY packages/core/package.json packages/core/

ENV HUSKY=0
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source code needed for build
COPY apps/auth ./apps/auth
COPY packages/core ./packages/core

# Build auth (bundles core)
RUN npx nx build auth
RUN npm prune --omit=dev

# ---------- Runtime ----------
FROM node:24.11.1-slim

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/auth/dist ./
COPY --from=builder /app/node_modules ./node_modules

USER node

CMD ["node", "index.cjs"]
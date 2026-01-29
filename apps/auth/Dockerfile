# ---------- Builder ----------
FROM node:24-alpine AS builder

WORKDIR /app

# Workspace metadata
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

# Per-project manifests for dependency graph
COPY apps/auth/package.json apps/auth/
COPY packages/core/package.json packages/core/

RUN npm ci

# Copy source code needed for build
COPY apps/auth ./apps/auth
COPY packages/core ./packages/core

# Build auth (bundles core)
RUN npx nx build auth

# ---------- Runtime ----------
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/auth/dist ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 80

CMD ["node", "index.cjs"]

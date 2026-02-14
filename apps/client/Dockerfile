# -------- Builder --------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
COPY eslint.config.mjs ./

COPY apps/client/package.json apps/client/

RUN npm i

COPY apps/client ./apps/client

RUN npx nx build client

# -------- Runtime stage --------
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy Next.js build output
COPY --from=builder /app/apps/client/.next ./.next
COPY --from=builder /app/apps/client/public ./public
COPY --from=builder /app/apps/client/package.json ./package.json

# Copy runtime deps only
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 80

CMD ["npx", "next", "start", "-p", "80"]

# -------- Builder --------
FROM node:24.11.1-slim AS builder

WORKDIR /app

RUN npm i -g npm@11.6.2

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
COPY eslint.config.mjs ./

COPY apps/client/package.json apps/client/

ENV HUSKY=0
RUN --mount=type=cache,target=/root/.npm npm ci

COPY apps/client ./apps/client

ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN npx nx build client

# -------- Runtime stage --------
FROM node:24.11.1-slim

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

COPY --from=builder /app/apps/client/.next/standalone ./
COPY --from=builder /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder /app/apps/client/public ./apps/client/public

USER node
EXPOSE 3000

CMD ["node", "apps/client/server.js"]

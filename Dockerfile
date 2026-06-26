# syntax=docker/dockerfile:1
# Image de production du front Next.js 16 (output standalone). Multi-stage : deps → build → run.

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# --- Dépendances (cache sur le lockfile) ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Le build n'a pas besoin du backend ; BACKEND_API_URL est lu au runtime (server-only).
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- Runtime (image légère, non-root) ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# `output: "standalone"` produit un serveur autonome + ses deps minimales.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
# BACKEND_API_URL doit être fourni au runtime (ex. -e BACKEND_API_URL=https://api-staging…).
CMD ["node", "server.js"]

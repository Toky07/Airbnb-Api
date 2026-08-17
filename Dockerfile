# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV npm_config_update_notifier=false

FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ dumb-init \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM deps AS build
COPY . .
RUN npm run build \
  && npm prune --omit=dev

# ---------------------------------------------------------------------------
# Development — hot reload (npm run start:dev)
# ---------------------------------------------------------------------------
FROM deps AS development
ENV ENVIRONMENT=dev \
    NODE_ENV=development
COPY . .
RUN mkdir -p uploads dist
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--", "/entrypoint.sh"]

# ---------------------------------------------------------------------------
# Production — build compilé (node dist/main.js)
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production \
    ENVIRONMENT=prod \
    npm_config_update_notifier=false

RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nestjs

COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
COPY --chown=nestjs:nodejs docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && mkdir -p uploads \
  && chown nestjs:nodejs uploads

USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--", "/entrypoint.sh"]

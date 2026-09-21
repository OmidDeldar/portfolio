# syntax=docker/dockerfile:1
#
# NOTE: this image builds from the REPOSITORY ROOT, not from web/.
# docker-compose.yml sets `context: .` and `dockerfile: web/Dockerfile`.
#
# The reason is scripts/sync-shared.mjs: the build regenerates web/src/data and
# web/src/lib/terminal.engine.ts from the API sources, so an image can never be
# built with stale content just because someone forgot to run `npm run sync`.

# ============================================================== build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Manifests first, so the dependency layer caches independently of source edits.
COPY web/package.json web/package-lock.json ./web/
RUN npm ci --prefix web

# The two files that are the single source of truth, plus the script that
# copies them into the web tree.
COPY scripts ./scripts
COPY api/src/data/portfolio.data.ts ./api/src/data/portfolio.data.ts
COPY api/src/modules/terminal/terminal.engine.ts ./api/src/modules/terminal/terminal.engine.ts

COPY web ./web

RUN node scripts/sync-shared.mjs

# Where the browser should reach the API.
#
# Left EMPTY on purpose for the compose setup: nginx proxies /api to the api
# service, so the front end talks to its own origin and there is no CORS at all.
# Override it only when the API is hosted on a different domain:
#   docker build --build-arg VITE_API_URL=https://api.example.com ...
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build --prefix web


# ============================================================ runtime stage
FROM nginx:1.27-alpine AS runtime

# Replace the stock config with ours (SPA fallback + /api proxy + caching).
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

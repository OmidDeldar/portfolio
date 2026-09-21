# syntax=docker/dockerfile:1

# ============================================================== build stage
# Compiles TypeScript to dist/. Needs devDependencies (nest CLI, typescript),
# none of which survive into the final image.
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifests first so `npm ci` is cached until a dependency actually changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY src ./src

RUN npm run build


# ========================================================= production deps
# A separate stage so the runtime image never sees the dev dependency tree.
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force


# ============================================================ runtime stage
FROM node:22-alpine AS runtime

# dumb-init gives us a real PID 1, so SIGTERM reaches node and the container
# shuts down promptly instead of waiting out the 10s kill timeout.
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

COPY --from=deps    --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist         ./dist
COPY --chown=node:node package.json ./

# The node:alpine images ship an unprivileged `node` user. Use it.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]

# ── Build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Required to compile bcrypt's native addon from source on Alpine
RUN apk add --no-cache python3 make g++

RUN npm ci
# Ensure server/node_modules exists so the runner COPY never fails,
# even when npm hoists all packages to the root node_modules.
RUN mkdir -p server/node_modules

COPY server/ ./server/
COPY client/ ./client/

# Regenerate Prisma client for the Linux target
# prisma is hoisted to the root node_modules by npm workspaces
RUN node_modules/.bin/prisma generate --schema=server/prisma/schema.prisma

# Compile TypeScript
RUN cd server && npm run build

# Bake relative API URL so the browser calls the same origin
ENV VITE_API_BASE_URL=/api/v1
RUN cd client && npm run build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Prisma needs libssl.so.3 at runtime to detect OpenSSL 3.x on Alpine
RUN apk add --no-cache openssl

# Root node_modules (npm workspace hoisting puts some packages here)
COPY --from=builder /app/node_modules        ./node_modules
COPY --from=builder /app/package.json        ./package.json

# Server artifacts
COPY --from=builder /app/server/dist         ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/server/prisma       ./server/prisma

# React SPA — served by Fastify via @fastify/static
COPY --from=builder /app/client/dist         ./client/dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server/dist/index.js"]

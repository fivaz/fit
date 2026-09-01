# Multi-stage Dockerfile for NestJS API in pnpm monorepo
# Optimized for Azure Container Apps with scale-to-zero

# ============================================
# Stage 1: Base image with pnpm
# ============================================
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ============================================
# Stage 2: Install production dependencies only
# ============================================
FROM base AS dependencies
WORKDIR /app

# Copy workspace and package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies using pnpm cache
# --ignore-scripts: the root postinstall runs `prisma generate`, which needs
# the `prisma` CLI devDependency that --prod skips. The Prisma client and
# shared package build already happen in the build stage and are copied
# into the runtime image separately, so this stage doesn't need postinstall.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts

# ============================================
# Stage 3: Build shared package and API
# ============================================
FROM base AS build
WORKDIR /app

# Copy workspace and package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (including dev deps for build)
# --ignore-scripts: postinstall runs `prisma generate`, but source (including
# prisma/schema.prisma) isn't copied in yet at this point. db:generate runs
# explicitly below once the source is present.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# Copy source code for shared package and API
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package first (required by API)
RUN pnpm --filter @fit/shared build

# Generate Prisma client (required before running API)
RUN pnpm --filter @fit/api db:generate

# ============================================
# Stage 4: Runtime - Minimal production image
# ============================================
FROM base AS runtime
WORKDIR /app

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy production dependencies from dependencies stage
# (packages/shared has no runtime dependencies, so it has no node_modules to copy)
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules

# Copy built artifacts from build stage
COPY --from=build --chown=nestjs:nodejs /app/apps/api/src ./apps/api/src
COPY --from=build --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=nestjs:nodejs /app/packages/shared/package.json ./packages/shared/package.json

# Copy Prisma schema and generated client
COPY --from=build --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma

# Copy tsconfig so tsx can resolve the "@/*" path alias at runtime
COPY --from=build --chown=nestjs:nodejs /app/apps/api/tsconfig.json ./apps/api/tsconfig.json

# Switch to non-root user
USER nestjs

# Environment variables
ENV NODE_ENV=production
ENV API_PORT=3001

# Expose API port
EXPOSE 3001

# Health check for Container Apps
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Start the API using pnpm start script
CMD ["pnpm", "--filter", "@fit/api", "start"]

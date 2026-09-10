# Docker Setup for Fit API

This directory contains the Dockerfile and scripts for containerizing the NestJS API for Azure Container Apps deployment.

## Overview

The Dockerfile uses a **multi-stage build** optimized for pnpm monorepos with the following stages:

1. **base**: Node.js 24 Alpine with pnpm enabled
2. **dependencies**: Install production dependencies only (minimal size)
3. **build**: Build shared package and generate Prisma client
4. **runtime**: Minimal production image with only necessary files

## Features

✅ **Multi-stage build** - Optimized image size (~200-300 MB final)
✅ **pnpm cache mount** - Faster builds with layer caching
✅ **Non-root user** - Runs as `nestjs` user for security
✅ **Health check** - Built-in health endpoint monitoring
✅ **Signal handling** - Graceful shutdown with dumb-init
✅ **Production-ready** - No dev dependencies in final image

## Quick Start

### 1. Build the Docker image

```bash
# From repo root
docker build -t fit-api:local -f apps/api/Dockerfile .

# Or use the helper script
./apps/api/docker-test.sh
```

### 2. Run the container locally

```bash
# Using .env file
docker run -p 3001:3001 --env-file .env fit-api:local

# Or with individual environment variables
docker run -p 3001:3001 \
  -e DATABASE_URL='postgresql://user:pass@host.docker.internal:5432/fit' \
  -e BETTER_AUTH_SECRET='your-secret-here' \
  -e API_BASE_URL='http://localhost:3001' \
  fit-api:local
```

### 3. Test the API

```bash
# Health check
curl http://localhost:3001/api/health

# Expected response: {"data":{"status":"ok"},"error":null}
```

## Environment Variables

### Required

| Variable             | Description                  | Example                               |
| -------------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string | `postgresql://user:pass@neon.tech/db` |
| `BETTER_AUTH_SECRET` | Session signing secret       | Generate: `openssl rand -base64 32`   |
| `API_BASE_URL`       | API origin URL               | `http://localhost:3001`               |

### Optional

| Variable                  | Description            | Default            |
| ------------------------- | ---------------------- | ------------------ |
| `API_PORT`                | Port to listen on      | `3001`             |
| `NODE_ENV`                | Environment            | `production`       |
| `CORS_ALLOWED_ORIGINS`    | Allowed CORS origins   | See `.env.example` |
| `OPENAI_API_KEY`          | AI coach functionality | -                  |
| `GOOGLE_CLIENT_ID/SECRET` | Social auth (Google)   | -                  |
| `GITHUB_CLIENT_ID/SECRET` | Social auth (GitHub)   | -                  |

See `.env.docker.example` for a complete template.

## Image Details

### Size Optimization

- **Base image**: `node:24-alpine` (~50 MB)
- **Production dependencies**: ~80-120 MB
- **Application code**: ~10-20 MB
- **Final image**: ~200-300 MB total

### Layers

1. Base Alpine + Node.js + pnpm
2. Production dependencies (cached)
3. Built shared package
4. Prisma generated client
5. Application source code

### Security

- Runs as non-root user (`nestjs:nodejs`)
- No unnecessary packages (Alpine minimal)
- Production dependencies only
- No .env files (secrets from environment)
- Health check enabled
- Proper signal handling with dumb-init

## Local Testing

### Build and run

```bash
# Build
docker build -t fit-api:local -f apps/api/Dockerfile .

# Run with local database
docker run -p 3001:3001 --env-file .env fit-api:local

# Run in background
docker run -d -p 3001:3001 --env-file .env --name fit-api fit-api:local

# View logs
docker logs -f fit-api

# Stop
docker stop fit-api && docker rm fit-api
```

### Inspect the container

```bash
# Interactive shell
docker run -it --entrypoint /bin/sh fit-api:local

# Check file structure
docker run --rm fit-api:local ls -la /app

# Check environment
docker run --rm fit-api:local printenv
```

### Debug build issues

```bash
# Build without cache
docker build --no-cache -t fit-api:local -f apps/api/Dockerfile .

# Build with progress output
docker build --progress=plain -t fit-api:local -f apps/api/Dockerfile .

# Inspect specific build stage
docker build --target=build -t fit-api:build -f apps/api/Dockerfile .
docker run -it --entrypoint /bin/sh fit-api:build
```

## Azure Container Apps Deployment

### Image tagging for Azure Container Registry

```bash
# Tag for ACR
docker tag fit-api:local <your-acr-name>.azurecr.io/fit-api:latest
docker tag fit-api:local <your-acr-name>.azurecr.io/fit-api:<git-sha>

# Login to ACR
az acr login --name <your-acr-name>

# Push to ACR
docker push <your-acr-name>.azurecr.io/fit-api:latest
docker push <your-acr-name>.azurecr.io/fit-api:<git-sha>
```

### Azure Container Apps Configuration

**Scale-to-Zero Settings:**

```yaml
scale:
  minReplicas: 0 # Scale to zero when idle
  maxReplicas: 3 # Max 3 instances
  rules:
    - http:
        concurrent: 10 # 10 concurrent requests per instance
```

**Environment Variables:**

```yaml
secrets:
  - name: database-url
    keyVaultUrl: https://<vault-name>.vault.azure.net/secrets/DATABASE-URL
  - name: auth-secret
    keyVaultUrl: https://<vault-name>.vault.azure.net/secrets/BETTER-AUTH-SECRET

env:
  - name: DATABASE_URL
    secretRef: database-url
  - name: BETTER_AUTH_SECRET
    secretRef: auth-secret
  - name: API_BASE_URL
    value: https://api.yourdomain.com
  - name: NODE_ENV
    value: production
```

**Health Probe:**

```yaml
probes:
  liveness:
    httpGet:
      path: /api/health
      port: 3001
    initialDelaySeconds: 10
    periodSeconds: 10
  readiness:
    httpGet:
      path: /api/health
      port: 3001
    initialDelaySeconds: 5
    periodSeconds: 5
```

## CI/CD Integration

This Dockerfile is designed to work with:

- **GitHub Actions** - See `.github/workflows/azure-production.yml` (to be created)
- **Azure DevOps** - See `azure-pipelines.yml` (to be created)

Both pipelines will:

1. Build this Docker image
2. Tag with git SHA and `latest`
3. Push to Azure Container Registry
4. Update Container Apps with new image

## Troubleshooting

### Build fails during dependency install

```bash
# Clear pnpm cache
docker builder prune

# Build without cache mount
docker build --no-cache -t fit-api:local -f apps/api/Dockerfile .
```

### Container exits immediately

```bash
# Check logs
docker logs <container-id>

# Run with interactive shell to debug
docker run -it --entrypoint /bin/sh fit-api:local
```

### Database connection fails

```bash
# For local PostgreSQL, use host.docker.internal instead of localhost
DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/fit

# For Neon or remote DB, use the full connection string
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/fit
```

### Health check fails

```bash
# Test health endpoint manually
curl http://localhost:3001/api/health

# Check if API is actually running
docker exec <container-id> ps aux

# Check network connectivity
docker exec <container-id> wget -O- http://localhost:3001/api/health
```

## Performance Notes

### Cold Start Time

- **First start**: ~10-15 seconds (Prisma initialization)
- **Warm start**: ~2-3 seconds
- **Scale from zero**: ~10-30 seconds (acceptable for portfolio)

### Memory Usage

- **Idle**: ~50-80 MB
- **Under load**: ~150-250 MB
- **Recommendation**: 1 GB memory per replica (allows headroom)

### CPU Usage

- **Idle**: ~0.01 vCPU
- **Under load**: ~0.2-0.5 vCPU
- **Recommendation**: 0.5 vCPU per replica

## Next Steps

After Docker setup is complete:

1. ✅ Test build locally
2. ✅ Test run with local database
3. ✅ Verify health check works
4. 🔲 Create Azure Container Registry
5. 🔲 Push image to ACR
6. 🔲 Set up GitHub Actions workflow
7. 🔲 Deploy to Azure Container Apps

See the main deployment plan in `/Users/fivaz/.claude/plans/jiggly-launching-pebble.md` for full Azure setup.

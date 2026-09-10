# Cost Optimization Guide

This guide explains how to reduce costs by making certain Azure services optional.

## Overview

The default deployment includes all services for a complete, production-ready setup. However, you can save costs by:

1. **Skipping Azure Container Registry** (saves $5/month) - Use GitHub Container Registry instead
2. **Reducing monitoring retention** (saves data costs)
3. **Using smaller resource sizes** (for dev/staging)

## Option 1: Skip Azure Container Registry (ACR)

**Savings: $5/month** (100% of baseline idle cost)

### Why Skip ACR?

Azure Container Registry costs $5/month even when idle (Basic tier). For a portfolio project, you can use free alternatives:

- **GitHub Container Registry (ghcr.io)** - Free, private images
- **Docker Hub** - Free for public images

### How to Skip ACR

#### Method A: Use the no-ACR parameter file

```bash
# Deploy without ACR using the pre-configured params file
az deployment group create \
  --resource-group rg-fittracker-prod \
  --template-file main.bicep \
  --parameters params.prod-no-acr.json
```

#### Method B: Modify your existing params file

Update `params.prod.json`:

```json
{
	"deployAcr": {
		"value": false
	},
	"externalAcrLoginServer": {
		"value": "ghcr.io"
	}
}
```

#### Method C: Override at deployment time

```bash
az deployment group create \
  --resource-group rg-fittracker-prod \
  --template-file main.bicep \
  --parameters params.prod.json \
  --parameters deployAcr=false externalAcrLoginServer=ghcr.io
```

### Using GitHub Container Registry

**Setup:**

1. **Enable GitHub Container Registry** for your repository:
   - Go to your GitHub repo → Settings → Actions → General
   - Under "Workflow permissions", enable "Read and write permissions"

2. **Update your GitHub Actions workflow** (Phase 3):

   ```yaml
   - name: Login to GitHub Container Registry
     uses: docker/login-action@v2
     with:
       registry: ghcr.io
       username: ${{ github.actor }}
       password: ${{ secrets.GITHUB_TOKEN }}

   - name: Build and push
     run: |
       docker build -t ghcr.io/${{ github.repository }}/fit-api:latest .
       docker push ghcr.io/${{ github.repository }}/fit-api:latest
   ```

3. **Update Container Apps image**:
   ```bash
   az containerapp update \
     --name ca-fittracker-api-prod \
     --resource-group rg-fittracker-prod \
     --image ghcr.io/yourusername/fit-tracker/fit-api:latest
   ```

### Using Docker Hub

**Setup:**

1. **Create Docker Hub account** (free)

2. **Make your image public** or upgrade to Pro ($5/month for private)

3. **Push images**:

   ```bash
   docker build -t yourusername/fit-api:latest .
   docker push yourusername/fit-api:latest
   ```

4. **Update Container Apps**:
   ```bash
   az containerapp update \
     --name ca-fittracker-api-prod \
     --resource-group rg-fittracker-prod \
     --image yourusername/fit-api:latest
   ```

## Option 2: Reduce Monitoring Costs

### Free Tier Optimization

Application Insights free tier includes 1 GB/month. To stay within this:

**Update `params.prod.json`:**

```json
{
	"dailyDataCapGb": 1, // Enforce 1 GB limit
	"retentionInDays": 30 // Reduce to 30 days (vs 90)
}
```

**In your application code**, increase sampling:

```typescript
// apps/api/src/main.ts
Sentry.init({
	dsn: "...",
	tracesSampleRate: 0.1, // 10% sampling
});
```

## Option 3: Use Smaller Resources (Dev/Staging)

For dev/staging environments, use smaller resource sizes:

```json
{
	"containerCpuCores": "0.25", // vs 0.5 in prod
	"containerMemory": "0.5Gi", // vs 1Gi in prod
	"containerAppMaxReplicas": 2, // vs 3 in prod
	"retentionInDays": 30 // vs 90 in prod
}
```

**Savings:** ~50% on compute costs during active hours

## Cost Comparison

| Configuration                     | Idle Cost | 10h/month | 100h/month |
| --------------------------------- | --------- | --------- | ---------- |
| **Full (with ACR)**               | $5.11     | $9.57     | $48.61     |
| **No ACR (GitHub Registry)**      | $0.11     | $4.57     | $43.61     |
| **No ACR + Optimized Monitoring** | $0.11     | $3.50     | $38.50     |

## Deployment Examples

### Absolute Minimum Cost

```bash
# Deploy with:
# - No ACR (use ghcr.io)
# - Minimal monitoring
# - Small resources

az deployment group create \
  --resource-group rg-fittracker-prod \
  --template-file main.bicep \
  --parameters params.prod-no-acr.json \
  --parameters containerCpuCores=0.25 containerMemory=0.5Gi \
  --parameters retentionInDays=30 dailyDataCapGb=1
```

**Result:** ~$0.50/month idle, ~$30/month at 100 hours active

### Recommended Balance

```bash
# Use ACR for professional demo, but optimize monitoring
az deployment group create \
  --resource-group rg-fittracker-prod \
  --template-file main.bicep \
  --parameters params.prod.json \
  --parameters retentionInDays=30 dailyDataCapGb=1
```

**Result:** ~$5/month idle, ~$40/month at 100 hours active

## Re-enabling Services

If you later want to add ACR:

1. **Update params**:

   ```json
   {
   	"deployAcr": { "value": true },
   	"externalAcrLoginServer": { "value": "" }
   }
   ```

2. **Redeploy**:

   ```bash
   az deployment group create \
     --resource-group rg-fittracker-prod \
     --template-file main.bicep \
     --parameters params.prod.json
   ```

3. **Migrate images**:

   ```bash
   # Pull from GitHub
   docker pull ghcr.io/yourusername/fit-tracker/fit-api:latest

   # Tag for ACR
   docker tag ghcr.io/yourusername/fit-tracker/fit-api:latest \
     acrfittrackerprod.azurecr.io/fit-api:latest

   # Push to ACR
   az acr login --name acrfittrackerprod
   docker push acrfittrackerprod.azurecr.io/fit-api:latest
   ```

## Best Practices

1. **Portfolio Projects**: Start without ACR to minimize costs
2. **Production Apps**: Use ACR for better control and security
3. **Dev/Staging**: Always use smaller resources
4. **Monitor Costs**: Set budget alerts at $10, $25, $50

## Cost Monitoring

```bash
# View current month costs
az consumption usage list \
  --resource-group rg-fittracker-prod \
  --start-date $(date -d '1 month ago' +%Y-%m-01) \
  --end-date $(date +%Y-%m-%d)

# Set budget alert
az consumption budget create \
  --resource-group rg-fittracker-prod \
  --budget-name monthly-limit \
  --amount 50 \
  --time-grain Monthly
```

## Summary

**Minimum viable cost:** ~$0.50/month idle

- Skip ACR (use ghcr.io)
- Optimize monitoring (1GB cap, 30 days retention)
- Scale-to-zero still works perfectly

**Recommended for portfolio:** ~$5/month idle

- Keep ACR (professional setup)
- Optimize monitoring
- Shows Azure-native patterns

Choose based on your budget and what you want to demonstrate!

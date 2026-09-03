# Automated Azure Deployment Guide

## Overview

This project uses **GitHub Actions** for automated CI/CD with a two-phase deployment approach:

1. **Phase 1**: Deploy infrastructure (Storage, KeyVault, Monitoring) - manual
2. **Phase 2**: Build Docker image + deploy Container Apps - automated via GitHub Actions

## Why Two Phases?

**Bootstrap Problem**: Container Apps needs a Docker image to exist before deployment. The solution:

- First manual deployment creates base infrastructure WITHOUT Container Apps
- GitHub Actions automatically builds the image, then deploys with Container Apps enabled

## Setup (One-Time)

> **Resource suffix:** `deploy.sh` accepts an optional 3rd argument that suffixes
> every resource name (e.g. `./infrastructure/bicep/deploy.sh dev northeurope 139d`,
> or `random` for a throwaway suffix) — this is how ephemeral/parallel dev stacks
> avoid colliding. If you deployed with one, set it here and every command below
> will pick it up automatically:
>
> ```bash
> export SUFFIX="139d"   # leave empty ("") if you didn't use a suffix
> ```

### 1. Create Azure Service Principal

```bash
az ad sp create-for-rbac \
  --name "fit-tracker-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-fittracker-dev${SUFFIX:+-$SUFFIX} \
  --json-auth
```

Copy the entire JSON output.

### 2. Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

**Name**: `AZURE_CREDENTIALS`
**Value**: Paste the JSON from step 1

### 3. Declare the Resource Suffix to GitHub

The `azure-deploy.yml` workflow reads the same suffix from a repository
**variable** (not a secret) so it targets the same resource group/Key Vault as
your manual deployment, instead of an unsuffixed `rg-fittracker-dev` that
doesn't exist:

```bash
gh variable set AZURE_RESOURCE_SUFFIX --body "$SUFFIX"
```

Or via GitHub UI: repo → Settings → Secrets and variables → Actions →
Variables → New repository variable, Name `AZURE_RESOURCE_SUFFIX`, Value your
suffix (leave it unset/empty if you're not using one).

### 4. Update Deployment Configuration

In `.github/workflows/azure-deploy.yml`, update line 18:

```yaml
IMAGE_NAME: ${{ github.repository }}/fit-api
```

Make sure this matches your GitHub username/org.

### 5. Initial Infrastructure Deployment (Manual)

Deploy base infrastructure WITHOUT Container Apps:

```bash
./infrastructure/bicep/deploy.sh dev northeurope "$SUFFIX"
```

This deploys:

- ✅ Storage Account (static website)
- ✅ Key Vault (with placeholder secrets)
- ✅ Log Analytics + Application Insights
- ✅ Monitoring alerts
- ❌ Container Apps (disabled - no Docker image yet)

**Cost**: ~$0.11/month (no ACR, no Container Apps running)

### 6. Grant Yourself Key Vault Secrets Access (RBAC)

The Key Vault uses **RBAC authorization** (not access policies), and the Bicep
template only grants the Container App's managed identity read access
(`Key Vault Secrets User`) — nobody is granted write access. Setting secret
values in the next step will fail with a `Forbidden` / `ForbiddenByRbac` error
until you assign yourself a data-plane role:

```bash
az role assignment create \
  --role "Key Vault Secrets Officer" \
  --assignee $(az ad signed-in-user show --query id -o tsv) \
  --scope /subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-fittracker-dev${SUFFIX:+-$SUFFIX}/providers/Microsoft.KeyVault/vaults/kv-fittracker-dev${SUFFIX:+-$SUFFIX}
```

This requires `Microsoft.Authorization/roleAssignments/write` on the resource
group (Owner or User Access Administrator) — ask whoever set up the
subscription to run it if you don't have that permission. Role assignments can
take a minute or two to propagate before the next step succeeds.

### 7. Update Key Vault Secrets

```bash
# Your actual Neon database URL
az keyvault secret set \
  --vault-name kv-fittracker-dev${SUFFIX:+-$SUFFIX} \
  --name DATABASE-URL \
  --value "postgresql://user:password@host/db?sslmode=require"

# Generate auth secret
az keyvault secret set \
  --vault-name kv-fittracker-dev${SUFFIX:+-$SUFFIX} \
  --name BETTER-AUTH-SECRET \
  --value "$(openssl rand -base64 32)"
```

## Automated Deployment (Every Push to Master)

Once setup is complete, **every push to `master` triggers**:

### GitHub Actions Workflow

```yaml
1. Build Docker Image
   ├─ Checkout code
   ├─ Build API Docker image
   └─ Push to ghcr.io/YOUR_USERNAME/fit-api:latest

2. Deploy Infrastructure
   ├─ Deploy Bicep templates
   ├─ Enable Container Apps (deployContainerApps=true)
   └─ Container Apps pulls the just-built image

3. Run Migrations
   └─ Execute Prisma migrations (pnpm run db:deploy)

4. Output URLs
   ├─ API URL: https://ca-fittracker-api-dev.xxx.eastus.azurecontainerapps.io
   └─ SPA URL: https://stfittrackerdev.z13.web.core.windows.net
```

### What Gets Deployed

**After first GitHub Actions run:**

- ✅ Storage Account (static website)
- ✅ Key Vault
- ✅ Log Analytics + Application Insights
- ✅ **Container Apps** (pulls `ghcr.io/YOUR_USERNAME/fit-api:latest`)

**Cost**: ~$0.11-5/month depending on usage (scales to zero when idle)

## Manual Deployment (Alternative)

If you prefer manual control:

```bash
# Build and push Docker image
docker build -t ghcr.io/YOUR_USERNAME/fit-api:latest -f apps/api/Dockerfile .
docker push ghcr.io/YOUR_USERNAME/fit-api:latest

# Deploy with Container Apps enabled
cd infrastructure/bicep
az deployment group create \
  --resource-group rg-fittracker-dev${SUFFIX:+-$SUFFIX} \
  --template-file main.bicep \
  --parameters params.dev.json \
  --parameters deployContainerApps=true \
  --parameters externalAcrLoginServer="ghcr.io/YOUR_USERNAME"
```

## Deployment Modes

### Dev (Recommended for Testing)

```json
{
	"deployAcr": false, // Use free GitHub Container Registry
	"deployContainerApps": false, // Disabled for initial deploy
	"deployCdn": false, // Azure CDN is deprecated
	"containerAppMinReplicas": 0, // Scale to zero (idle cost: $0)
	"containerCpuCores": "0.25", // Minimal resources
	"containerMemory": "0.5Gi"
}
```

**Initial deploy cost**: $0.11/month
**With Container Apps running 24/7**: ~$15/month
**With scale-to-zero (recommended)**: $0.11/month when idle

### Prod (Future)

```json
{
	"deployAcr": true, // Azure ACR ($5/month)
	"deployContainerApps": true, // Always deployed
	"deployCdn": false, // Use Cloudflare or Azure Front Door
	"containerAppMinReplicas": 0, // Still scale to zero
	"containerCpuCores": "0.5",
	"containerMemory": "1.0Gi"
}
```

## Monitoring

### View Logs

```bash
# Container App logs
az containerapp logs show \
  --name ca-fittracker-api-dev${SUFFIX:+-$SUFFIX} \
  --resource-group rg-fittracker-dev${SUFFIX:+-$SUFFIX} \
  --follow

# Application Insights
az monitor app-insights query \
  --app appi-fittracker-dev${SUFFIX:+-$SUFFIX} \
  --resource-group rg-fittracker-dev${SUFFIX:+-$SUFFIX} \
  --analytics-query "requests | take 10"
```

### Check Deployment Status

GitHub Actions → Your workflow run → See deployment summary

Or via CLI:

```bash
az deployment group list \
  --resource-group rg-fittracker-dev${SUFFIX:+-$SUFFIX} \
  --output table
```

## Troubleshooting

### "Image not found" error

Container Apps can't pull the image. Check:

1. Image exists: `docker manifest inspect ghcr.io/YOUR_USERNAME/fit-api:latest`
2. Image is public OR Container App has pull permissions
3. Correct registry URL in `externalAcrLoginServer` parameter

### "Scale to zero not working"

Check Container App configuration:

```bash
az containerapp show \
  --name ca-fittracker-api-dev${SUFFIX:+-$SUFFIX} \
  --resource-group rg-fittracker-dev${SUFFIX:+-$SUFFIX} \
  --query "properties.template.scale"
```

Should show `minReplicas: 0`.

### "Deployment failed" in GitHub Actions

1. Check `AZURE_CREDENTIALS` secret is set correctly
2. Check the `AZURE_RESOURCE_SUFFIX` repo variable matches the suffix your
   resource group actually uses (`gh variable list`) — an
   `AuthorizationFailed` / "scope is invalid" error usually means the
   workflow is targeting a resource group name that doesn't exist
3. Verify service principal has `Contributor` role on resource group. If you
   created the service principal (step 1) before setting a suffix, or changed
   the suffix afterwards, re-scope it:
   ```bash
   az role assignment create --assignee <service-principal-appId> --role Contributor --scope /subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-fittracker-dev${SUFFIX:+-$SUFFIX}
   ```
4. Check Azure subscription has required resource providers registered

## Cost Optimization

### Current Configuration (Dev)

| Resource       | Idle Cost           | Active (100h/month) |
| -------------- | ------------------- | ------------------- |
| Storage        | $0.01               | $0.01               |
| Key Vault      | $0.10               | $0.50               |
| App Insights   | $0 (free tier)      | $0-2                |
| Container Apps | $0 (scaled to zero) | $35                 |
| **Total**      | **$0.11/month**     | **~$37/month**      |

### Cost Reduction Tips

1. **Scale to zero**: Set `minReplicas: 0` ✅ Already configured
2. **Skip ACR**: Use GitHub Container Registry ✅ Already configured
3. **No CDN**: Use direct storage URL or external CDN ✅ Already configured
4. **Free database**: Use Neon free tier ✅ Already configured

## Next Steps

1. ✅ Run initial deployment: `./infrastructure/bicep/deploy.sh dev`
2. ✅ Declare `AZURE_RESOURCE_SUFFIX` as a GitHub repo variable
3. ✅ Grant yourself Key Vault Secrets Officer access (RBAC)
4. ✅ Update Key Vault secrets
5. ✅ Push to `master` branch → triggers automated deployment
6. 🎉 Your app is live!

For production deployment, create `params.prod.json` and deploy to a separate resource group.

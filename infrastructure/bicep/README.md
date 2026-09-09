# Azure Infrastructure - Bicep Templates

Infrastructure as Code for deploying Fit Tracker to Azure with a **scale-to-zero architecture**.

## Overview

This Bicep configuration deploys a complete Azure infrastructure optimized for cost-efficiency and portfolio demonstration:

- **Azure Container Apps** - Scale-to-zero NestJS API ($0 idle cost)
- **Azure Storage** - Static website hosting for Next.js SPA
- **Azure CDN** - Global content delivery (pay-per-use)
- **Azure Container Registry** - Private Docker image registry ($5/month)
- **Azure Key Vault** - Secrets management with managed identities
- **Application Insights** - Monitoring and alerting (free tier)

**Estimated Monthly Cost:**

- **Idle (zero traffic)**: $5-10/month
- **Light usage (10 hours/month active)**: $10-15/month
- **Moderate usage (100 hours/month)**: $50-60/month

## Prerequisites

1. **Azure CLI** installed and authenticated:

   ```bash
   az login
   az account set --subscription <your-subscription-id>
   ```

2. **Azure subscription** with contributor access

3. **Bicep CLI** (included with Azure CLI 2.20+):
   ```bash
   az bicep version
   ```

## Quick Start

### 1. Create Resource Group

```bash
az group create \
  --name rg-fittracker-prod \
  --location northeurope \
  --tags Project="Fit Tracker" Environment="Production"
```

### 2. Deploy Infrastructure

```bash
# From /infrastructure/bicep directory
az deployment group create \
  --resource-group rg-fittracker-prod \
  --template-file main.bicep \
  --parameters params.prod.json
```

### 3. Update Secrets in Key Vault

After deployment, update placeholder secrets:

```bash
# Get your Neon database URL
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/fittracker"

# Generate auth secret
BETTER_AUTH_SECRET=$(openssl rand -base64 32)

# Update Key Vault secrets
az keyvault secret set \
  --vault-name kv-fittracker-prod \
  --name "DATABASE-URL" \
  --value "$DATABASE_URL"

az keyvault secret set \
  --vault-name kv-fittracker-prod \
  --name "BETTER-AUTH-SECRET" \
  --value "$BETTER_AUTH_SECRET"

# Optional: AI and social auth
az keyvault secret set --vault-name kv-fittracker-prod --name "OPENAI-API-KEY" --value "$OPENAI_API_KEY"
az keyvault secret set --vault-name kv-fittracker-prod --name "GOOGLE-CLIENT-ID" --value "$GOOGLE_CLIENT_ID"
az keyvault secret set --vault-name kv-fittracker-prod --name "GOOGLE-CLIENT-SECRET" --value "$GOOGLE_CLIENT_SECRET"
```

## Module Architecture

```
main.bicep                       # Orchestrator (entry point)
├── modules/
│   ├── storage.bicep           # Static website + Azure CDN
│   ├── container-registry.bicep # ACR for Docker images
│   ├── container-apps.bicep    # API with scale-to-zero
│   ├── key-vault.bicep         # Secrets management
│   └── monitoring.bicep        # App Insights + alerts
└── params.prod.json            # Production parameters
```

## Deployment Parameters

### Required Parameters

| Parameter     | Description               | Example                                         |
| ------------- | ------------------------- | ----------------------------------------------- |
| `environment` | Environment name          | `prod`, `staging`, `dev`                        |
| `location`    | Azure region              | `westeurope`, `northeurope`, `switzerlandnorth` |
| `projectName` | Project name (3-10 chars) | `fittracker`                                    |

### Scale-to-Zero Configuration

| Parameter                 | Default | Description                       |
| ------------------------- | ------- | --------------------------------- |
| `containerAppMinReplicas` | `0`     | **Critical:** 0 for scale-to-zero |
| `containerAppMaxReplicas` | `3`     | Max instances under load          |
| `containerCpuCores`       | `0.5`   | CPU per container                 |
| `containerMemory`         | `1Gi`   | Memory per container              |

### Custom Domain (Cloudflare-fronted)

Every environment's frontend and API sit behind [Cloudflare](https://cloudflare.com) (DNS, CDN, TLS) rather than Azure CDN — `sfivaz.com`'s nameservers are delegated to Cloudflare. `azure-deploy.yml` syncs the required DNS records automatically on every deploy (idempotent — a no-op once records already match).

| Parameter               | Default | Description                                                                                                                            |
| ----------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `enableCdnCustomDomain` | `false` | Legacy Azure CDN flag — unrelated to the Cloudflare setup below, kept `false` everywhere. See `storage.bicep`'s deprecated CDN module. |
| `customDomainName`      | `''`    | Frontend hostname, e.g. `fit-staging.sfivaz.com`. **Never set declaratively via Bicep for the storage account** — see the note below.  |

The API's custom domain (`api-fit-<env>.sfivaz.com`) has **no Bicep parameter at all** — it's bound purely imperatively in `azure-deploy.yml`, for the same underlying reason as the frontend, discovered the hard way:

**Why neither custom domain is ever set declaratively in Bicep:** the original design tried making the API's case declarative, on the theory that its managed certificate validates via a TXT record (`domainControlValidation: 'TXT'`), which — unlike the storage account's CNAME-based check — Cloudflare can't interfere with by proxying. That theory turned out to be irrelevant to the actual failure mode: `az deployment group what-if` against the real dev environment proved that ARM replaces the Container App's `ingress` object **wholesale** on every deployment — even a Bicep template that never mentions `customDomains` at all still clears an existing binding, because omission and explicit-empty are indistinguishable to ARM for this property. A live custom domain binding, once established, can only survive across deploys by being reasserted outside Bicep every time. So:

- **Frontend:** `azure-deploy.yml`'s "Register storage custom domain" step — checks the current value via `az storage account show`, and only if it doesn't match, briefly flips the CNAME to DNS-only, runs `az storage account update --custom-domain`, then flips it back to proxied. (Separately necessary here too: Azure Storage re-verifies this CNAME against live public DNS on _every_ deployment, which a Cloudflare-proxied record fails outright — `StorageDomainNameCouldNotVerify`.)
- **API:** `azure-deploy.yml`'s "Bind API custom domain" step — checks `az containerapp hostname list` for `bindingType: SniEnabled`, and only if not yet bound, runs `az containerapp hostname add` + `az containerapp hostname bind --validation-method TXT`. Unlike the storage step, this one is **best-effort** (`continue-on-error: true`) rather than blocking: see the bootstrap runbook below for why.

#### Bootstrap runbook (one-time per new environment)

1. Deploy once with `deployContainerApps=true` — `azure-deploy.yml` reads `apiFqdn` and `apiCustomDomainVerificationId` from the deployment outputs and syncs the `asuid.<hostname>` TXT + API CNAME + frontend CNAME via the `cloudflare-dns-record` composite action automatically, no manual DNS step needed.
2. The same run's "Bind API custom domain" step attempts `hostname add` + `hostname bind`. **This frequently does not succeed on the first attempt** — bootstrapping dev needed three delete-and-retry cycles before it worked. What was learned:
   - Requesting the managed certificate prints its own `validationToken`, separate from the `asuid` ownership token, that must additionally exist as a TXT record at `_dnsauth.<hostname>`. `az containerapp env certificate list` shows `provisioningState: Pending` and this token if a cert is stuck on it.
   - **The token is regenerated fresh on every certificate creation attempt** — it is not stable per hostname. Re-running `hostname bind` against an already-`Pending` certificate does not re-attempt validation; it just reports the same failure. The only way to get a fresh validation attempt is to delete the stuck certificate (`az containerapp env certificate delete`) and re-run `hostname add` + `hostname bind`, which mints a new certificate resource with a new token that DNS must be updated to match.
   - Once DNS is correct, give it the full time Azure warns about ("up to 20 minutes") before assuming it's stuck — the successful bootstrap attempt for dev took several minutes of real waiting after the DNS fix, not the ~1 minute each earlier retry allowed.
3. Because of that flakiness, the CI step doesn't block the deploy on this succeeding — the API stays reachable at its raw `*.azurecontainerapps.io` URL either way, and the idempotent check means every subsequent run retries for free until it eventually succeeds. If it's still not bound after a few automatic attempts, do the delete-and-retry cycle above manually once, same as dev's bootstrap.
4. Assign the initial `production` revision label once blue-green traffic routing is finished (see below) — not required yet, since traffic currently follows `latestRevision` unconditionally.

### Blue-Green Deployment (staging/prod)

`container-apps.bicep` runs in `activeRevisionsMode: 'Multiple'`, with ingress traffic pinned to an explicit revision rather than whatever deployed most recently — each deploy passes `revisionSuffix` (the short git SHA), giving the new revision its own directly addressable FQDN so it can be smoke-tested with zero live traffic before cutover.

**On the `label` vs `revisionName` distinction (a real gotcha, not just cosmetics):** Azure's traffic-weight object does not accept `label` as an independent routing key — ARM rejects it outright (`ContainerAppTrafficWeightInvalidRevisionName: Traffic weight must provide "RevisionName" if "LatestRevision" is false`, reproduced live via `az deployment group what-if`). A label is metadata attached alongside an explicit `revisionName`, not a Kubernetes-style selector Azure resolves on its own. So `container-apps.bicep` takes a `currentProductionRevisionName` parameter: empty means bootstrap mode (`traffic: [{ latestRevision: true, weight: 100 }]`, since nothing holds the `production` label yet on a environment's first blue-green-aware deploy); non-empty pins traffic explicitly at that revision (`traffic: [{ revisionName: <name>, label: 'production', weight: 100 }]`), leaving the just-deployed revision at 0% until cutover.

`azure-deploy.yml`'s "Determine traffic routing mode" step (before the Bicep deploy) reads this straight from live state — `az containerapp show --query "...traffic[?label=='production'].revisionName"` — so it's self-bootstrapping per environment with no manual step: an environment's first-ever deploy naturally gets `latestRevision` routing (nothing to pin to yet), and the very next deploy automatically switches to real label-pinned routing once a revision has been labeled.

- **Staging/prod:** the `containerapp-bluegreen-cutover` composite action smoke-tests the new revision's `/api/health` directly at its own FQDN, and only then moves the `production` label onto it (`az containerapp revision label add`) — the actual cutover. A failed smoke test leaves live traffic untouched on the old revision.
- **Dev:** skips the smoke-test gate and moves the label immediately after every deploy, for fast disposable iteration.
- **Rollback:** re-run the label-add command pointed at the previous revision name — no rebuild, seconds not minutes.
- **Migration requirement:** both the old and new revision share one database until cutover completes, so staging/prod migrations must be expand/contract-safe (additive first — never a destructive drop/rename in the same deploy that stops using the old shape). A destructive migration breaks the still-live old revision the instant it runs, regardless of traffic weight.
- **The frontend does not get blue-green treatment** — a true swap would need dual storage accounts and would re-trigger the CNAME verification cost above on every deploy. It keeps a direct `$web` overwrite, which is already near-atomic since Next.js content-hashes `_next/static/*` filenames; rollback is redeploying the previous static export.

- **The frontend does not get blue-green treatment** — a true swap would need dual storage accounts and would re-trigger the CNAME verification cost above on every deploy. It keeps a direct `$web` overwrite, which is already near-atomic since Next.js content-hashes `_next/static/*` filenames; rollback is redeploying the previous static export.

### Dev Iteration (Recreate/Teardown)

| Parameter                       | Default | Description                                                                                                                                                       |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resourceSuffix`                | `''`    | Lowercase alphanumeric suffix (max 5 chars) appended to every resource name. Use for a throwaway parallel stack that can't collide with the main deployment.      |
| `enableKeyVaultPurgeProtection` | `true`  | Set `false` for dev (already the default in `params.dev.json`) so a deleted Key Vault can be purged immediately instead of blocking recreation for up to 90 days. |

`params.dev.json` ships with `enableKeyVaultPurgeProtection: false`, so `deploy.sh` and `teardown.sh` can freely delete and recreate the dev environment:

```bash
# Tear down dev (deletes the resource group and purges the Key Vault)
./teardown.sh dev

# Recreate dev from scratch
./deploy.sh dev
```

If a dev Key Vault was created _before_ this setting existed, it may still have purge protection on and will block recreation until Azure auto-purges it (`teardown.sh` prints the exact date). In that case, deploy with a random suffix instead of waiting:

```bash
./deploy.sh dev northeurope random
```

This creates a fully separate `rg-fittracker-dev-<suffix>` resource group that won't touch your main dev stack.

## Deployment Commands

### Production Deployment

```bash
az deployment group create \
  --resource-group rg-fittracker-prod \
  --template-file main.bicep \
  --parameters params.prod.json
```

### Development/Staging Deployment

```bash
# Create dev resource group
az group create --name rg-fittracker-dev --location northeurope

# Deploy with dev parameters
az deployment group create \
  --resource-group rg-fittracker-dev \
  --template-file main.bicep \
  --parameters environment=dev containerAppMinReplicas=0
```

### What-If Deployment (Preview Changes)

```bash
az deployment group what-if \
  --resource-group rg-fittracker-prod \
  --template-file main.bicep \
  --parameters params.prod.json
```

### Validate Template

```bash
az deployment group validate \
  --resource-group rg-fittracker-prod \
  --template-file main.bicep \
  --parameters params.prod.json
```

## Post-Deployment Steps

### 1. Update Key Vault Secrets

See "Update Secrets in Key Vault" section above.

### 2. Push Initial Docker Image

```bash
# Build and tag
docker build -t fit-api:latest -f apps/api/Dockerfile .

# Login to ACR
az acr login --name acrfittrackerprod

# Tag for ACR
docker tag fit-api:latest acrfittrackerprod.azurecr.io/fit-api:latest

# Push
docker push acrfittrackerprod.azurecr.io/fit-api:latest
```

### 3. Update Container App Image

```bash
az containerapp update \
  --name ca-fittracker-api-prod \
  --resource-group rg-fittracker-prod \
  --image acrfittrackerprod.azurecr.io/fit-api:latest
```

### 4. Upload Static Website

```bash
# Build Next.js static export
pnpm run build:static

# Upload to Storage
az storage blob upload-batch \
  --account-name stfittrackerprod \
  --auth-mode key \
  --destination '$web' \
  --source ./apps/web/out \
  --overwrite
```

### 5. Verify Deployment

```bash
# Get Container App URL
az containerapp show \
  --name ca-fittracker-api-prod \
  --resource-group rg-fittracker-prod \
  --query properties.configuration.ingress.fqdn \
  --output tsv

# Test health endpoint
curl https://<container-app-fqdn>/api/health

# Get CDN URL
az cdn endpoint show \
  --profile-name cdn-fittracker-prod \
  --name fittracker-prod \
  --resource-group rg-fittracker-prod \
  --query hostName \
  --output tsv
```

## Cost Management

### Enable Cost Alerts

```bash
# Set budget alert at $50/month
az consumption budget create \
  --resource-group rg-fittracker-prod \
  --budget-name monthly-budget \
  --amount 50 \
  --time-grain Monthly \
  --time-period start-date=2024-01-01 \
  --notifications \
    Actual_GreaterThan_80_Percent='{
      "enabled": true,
      "operator": "GreaterThan",
      "threshold": 80,
      "contactEmails": ["your-email@example.com"]
    }'
```

### View Current Costs

```bash
az consumption usage list \
  --resource-group rg-fittracker-prod \
  --start-date 2024-01-01 \
  --end-date 2024-01-31
```

## Monitoring

### View Application Insights

```bash
# Get App Insights connection string
az monitor app-insights component show \
  --app appi-fittracker-prod \
  --resource-group rg-fittracker-prod \
  --query connectionString \
  --output tsv
```

### Query Logs

```bash
# Recent API requests
az monitor app-insights query \
  --app appi-fittracker-prod \
  --resource-group rg-fittracker-prod \
  --analytics-query "requests | top 10 by timestamp desc"

# Error rate
az monitor app-insights query \
  --app appi-fittracker-prod \
  --resource-group rg-fittracker-prod \
  --analytics-query "requests | where success == false | summarize count() by bin(timestamp, 1h)"
```

## Scaling

### Manual Scale

```bash
# Scale to specific replica count
az containerapp update \
  --name ca-fittracker-api-prod \
  --resource-group rg-fittracker-prod \
  --min-replicas 1 \
  --max-replicas 5
```

### Verify Scale-to-Zero

```bash
# Check current replicas
az containerapp replica list \
  --name ca-fittracker-api-prod \
  --resource-group rg-fittracker-prod \
  --query "[].name"

# After 5+ minutes of no traffic, should return empty array []
```

## Cleanup

### Delete Resource Group (Everything)

```bash
az group delete --name rg-fittracker-prod --yes --no-wait
```

### Delete Specific Resources

```bash
# Delete Container App only
az containerapp delete \
  --name ca-fittracker-api-prod \
  --resource-group rg-fittracker-prod \
  --yes

# Delete Storage Account
az storage account delete \
  --name stfittrackerprod \
  --resource-group rg-fittracker-prod \
  --yes
```

## Troubleshooting

### Container App Won't Start

```bash
# View logs
az containerapp logs show \
  --name ca-fittracker-api-prod \
  --resource-group rg-fittracker-prod \
  --follow

# Check revision status
az containerapp revision list \
  --name ca-fittracker-api-prod \
  --resource-group rg-fittracker-prod \
  --query "[].{Name:name, Active:properties.active, Health:properties.healthState}"
```

### Key Vault Access Denied

```bash
# Verify managed identity has access
az role assignment list \
  --assignee <container-app-principal-id> \
  --scope /subscriptions/<sub-id>/resourceGroups/rg-fittracker-prod/providers/Microsoft.KeyVault/vaults/kv-fittracker-prod
```

### Deployment Failed

```bash
# View deployment logs
az deployment group show \
  --resource-group rg-fittracker-prod \
  --name monitoring-deployment \
  --query properties.error

# Validate Bicep template
az bicep build --file main.bicep
```

## CI/CD Integration

This infrastructure is designed to work with:

- **GitHub Actions** - See `.github/workflows/azure-production.yml` (Phase 3)
- **Azure DevOps** - See `azure-pipelines.yml` (Phase 4)

Both will:

1. Build Docker image
2. Push to ACR
3. Update Container Apps
4. Upload static site to Storage
5. Purge CDN cache

## Security Checklist

- [ ] All secrets in Key Vault (not in code)
- [ ] Managed identities for authentication (no passwords)
- [ ] HTTPS enforced (HTTP disabled)
- [ ] ACR admin user disabled
- [ ] Storage public blob access disabled
- [ ] Key Vault soft delete + purge protection enabled
- [ ] Application Insights sampling enabled (reduce costs)
- [ ] CORS properly configured (no wildcard `*`)
- [ ] Budget alerts configured
- [ ] Alert rules for errors and performance

## Next Steps

After infrastructure deployment:

1. ✅ Update Key Vault secrets
2. ✅ Push Docker image to ACR
3. ✅ Upload static website to Storage
4. 🔲 Configure custom domain + SSL (Phase 7)
5. 🔲 Set up GitHub Actions CI/CD (Phase 3)
6. 🔲 Set up Azure DevOps pipeline (Phase 4)
7. 🔲 Configure monitoring dashboards (Phase 6)

## Resources

- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Azure CDN Documentation](https://learn.microsoft.com/en-us/azure/cdn/)
- [Azure Key Vault Documentation](https://learn.microsoft.com/en-us/azure/key-vault/)

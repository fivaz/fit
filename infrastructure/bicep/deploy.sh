#!/bin/bash
# Azure Infrastructure Deployment Script
# Deploys Fit Tracker infrastructure using Bicep templates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine script directory (works from anywhere)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
ENVIRONMENT="${1:-prod}"
LOCATION="${2:-northeurope}"
RESOURCE_SUFFIX="${3:-}"

# Pass "random" as the 3rd arg to generate a throwaway suffix, e.g.:
#   ./deploy.sh dev northeurope random
# This spins up a fully separate resource group + resource set that won't
# collide with your main dev stack, for parallel/throwaway testing.
if [ "$RESOURCE_SUFFIX" = "random" ]; then
    RESOURCE_SUFFIX="$(openssl rand -hex 2)"
fi

PROJECT_NAME="fittracker"
RG_NAME="rg-${PROJECT_NAME}-${ENVIRONMENT}${RESOURCE_SUFFIX:+-$RESOURCE_SUFFIX}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Fit Tracker - Azure Infrastructure Deployment        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment:${NC} $ENVIRONMENT"
echo -e "${YELLOW}Location:${NC} $LOCATION"
echo -e "${YELLOW}Resource Group:${NC} $RG_NAME"
if [ -n "$RESOURCE_SUFFIX" ]; then
    echo -e "${YELLOW}Resource Suffix:${NC} $RESOURCE_SUFFIX"
fi
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    echo "   Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
echo -e "${BLUE}🔐 Checking Azure authentication...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Running 'az login'...${NC}"
    az login
fi

# Show current subscription
SUBSCRIPTION=$(az account show --query name --output tsv)
echo -e "${GREEN}✓${NC} Logged in to subscription: ${GREEN}$SUBSCRIPTION${NC}"
echo ""

# Create resource group if it doesn't exist
echo -e "${BLUE}📦 Creating resource group: $RG_NAME${NC}"
az group create \
    --name "$RG_NAME" \
    --location "$LOCATION" \
    --tags Project="Fit Tracker" Environment="$ENVIRONMENT" ManagedBy="Bicep" \
    --output none

echo -e "${GREEN}✓${NC} Resource group created/updated"
echo ""

# Validate Bicep template
echo -e "${BLUE}🔍 Validating Bicep template...${NC}"
if az deployment group validate \
    --resource-group "$RG_NAME" \
    --template-file "$SCRIPT_DIR/main.bicep" \
    --parameters "$SCRIPT_DIR/params.${ENVIRONMENT}.json" resourceSuffix="$RESOURCE_SUFFIX" \
    --output none 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Template validation passed"
else
    echo -e "${RED}❌ Template validation failed${NC}"
    exit 1
fi
echo ""

# Run what-if to preview changes
echo -e "${BLUE}📋 Previewing deployment changes (what-if)...${NC}"
az deployment group what-if \
    --resource-group "$RG_NAME" \
    --template-file "$SCRIPT_DIR/main.bicep" \
    --parameters "$SCRIPT_DIR/params.${ENVIRONMENT}.json" resourceSuffix="$RESOURCE_SUFFIX"
echo ""

# Confirm deployment
read -p "$(echo -e ${YELLOW}Continue with deployment? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Deployment cancelled${NC}"
    exit 0
fi

# Deploy infrastructure
echo -e "${BLUE}🚀 Deploying infrastructure...${NC}"
echo -e "${YELLOW}This may take 5-10 minutes...${NC}"
echo ""

DEPLOYMENT_NAME="fittracker-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"

if az deployment group create \
    --resource-group "$RG_NAME" \
    --template-file "$SCRIPT_DIR/main.bicep" \
    --parameters "$SCRIPT_DIR/params.${ENVIRONMENT}.json" resourceSuffix="$RESOURCE_SUFFIX" \
    --name "$DEPLOYMENT_NAME" \
    --output json > "$SCRIPT_DIR/deployment-output.json"; then

    echo ""
    echo -e "${GREEN}✅ Infrastructure deployment completed successfully!${NC}"
    echo ""

    # Extract outputs
    echo -e "${BLUE}📊 Deployment Outputs:${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    SPA_URL=$(jq -r '.properties.outputs.cdnEndpointUrl.value // "N/A"' "$SCRIPT_DIR/deployment-output.json")
    API_URL=$(jq -r '.properties.outputs.apiUrl.value // "N/A"' "$SCRIPT_DIR/deployment-output.json")
    ACR_NAME=$(jq -r '.properties.outputs.acrName.value // "N/A"' "$SCRIPT_DIR/deployment-output.json")
    ACR_LOGIN=$(jq -r '.properties.outputs.acrLoginServer.value // "N/A"' "$SCRIPT_DIR/deployment-output.json")
    KV_NAME=$(jq -r '.properties.outputs.keyVaultName.value // "N/A"' "$SCRIPT_DIR/deployment-output.json")
    STORAGE_NAME=$(jq -r '.properties.outputs.storageAccountName.value // "N/A"' "$SCRIPT_DIR/deployment-output.json")
    APP_INSIGHTS=$(jq -r '.properties.outputs.appInsightsName.value // "N/A"' "$SCRIPT_DIR/deployment-output.json")

    echo -e "${GREEN}SPA URL:${NC} $SPA_URL"
    echo -e "${GREEN}API URL:${NC} $API_URL"
    echo -e "${GREEN}Container Registry:${NC} $ACR_LOGIN"
    echo -e "${GREEN}Storage Account:${NC} $STORAGE_NAME"
    echo -e "${GREEN}Key Vault:${NC} $KV_NAME"
    echo -e "${GREEN}App Insights:${NC} $APP_INSIGHTS"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Next steps
    echo -e "${BLUE}📝 Next Steps:${NC}"
    echo ""
    echo -e "1. ${YELLOW}Update Key Vault Secrets:${NC}"
    echo "   az keyvault secret set --vault-name $KV_NAME --name 'DATABASE-URL' --value 'your-neon-db-url'"
    echo "   az keyvault secret set --vault-name $KV_NAME --name 'BETTER-AUTH-SECRET' --value \"\$(openssl rand -base64 32)\""
    echo ""
    echo -e "2. ${YELLOW}Build and Push Docker Image:${NC}"
    echo "   docker build -t fit-api:latest -f apps/api/Dockerfile ."
    echo "   az acr login --name $ACR_NAME"
    echo "   docker tag fit-api:latest $ACR_LOGIN/fit-api:latest"
    echo "   docker push $ACR_LOGIN/fit-api:latest"
    echo ""
    echo -e "3. ${YELLOW}Upload Static Website:${NC}"
    echo "   pnpm run build:static"
    echo "   az storage blob upload-batch --account-name $STORAGE_NAME --auth-mode key --destination '\$web' --source ./apps/web/out --overwrite"
    echo ""
    echo -e "4. ${YELLOW}Verify Deployment:${NC}"
    echo "   curl $API_URL/api/health"
    echo "   open $SPA_URL"
    echo ""
    echo -e "${GREEN}✨ Infrastructure is ready!${NC}"

    # Save outputs to file
    echo -e "${BLUE}💾 Deployment outputs saved to: $SCRIPT_DIR/deployment-output.json${NC}"

else
    echo ""
    echo -e "${RED}❌ Infrastructure deployment failed${NC}"
    echo -e "${YELLOW}Check the error messages above for details${NC}"
    exit 1
fi

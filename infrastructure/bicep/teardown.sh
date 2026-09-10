#!/bin/bash
# Azure Infrastructure Teardown Script
# Deletes a Fit Tracker environment's resource group and purges its Key Vault
# so the same resource names are immediately reusable on the next deploy.sh run.
#
# Usage:
#   ./teardown.sh <environment> [suffix]
#
# Only intended for dev/staging where enableKeyVaultPurgeProtection is false
# (see params.dev.json). Refuses to run against prod.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ENVIRONMENT="${1:?Usage: ./teardown.sh <environment> [suffix]}"
RESOURCE_SUFFIX="${2:-}"
PROJECT_NAME="fittracker"

if [ "$ENVIRONMENT" = "prod" ]; then
    echo -e "${RED}❌ Refusing to tear down 'prod'. This script is for dev/staging only.${NC}"
    exit 1
fi

RG_NAME="rg-${PROJECT_NAME}-${ENVIRONMENT}${RESOURCE_SUFFIX:+-$RESOURCE_SUFFIX}"
KV_NAME="kv-${PROJECT_NAME}-${ENVIRONMENT}${RESOURCE_SUFFIX:+-$RESOURCE_SUFFIX}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Fit Tracker - Azure Infrastructure Teardown           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Resource Group:${NC} $RG_NAME"
echo -e "${YELLOW}Key Vault:${NC} $KV_NAME"
echo ""

if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed.${NC}"
    exit 1
fi

if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Running 'az login'...${NC}"
    az login
fi

if ! az group show --name "$RG_NAME" --output none 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Resource group '$RG_NAME' does not exist. Nothing to delete.${NC}"
else
    read -p "$(echo -e ${YELLOW}Delete resource group '$RG_NAME' and everything in it? [y/N]:${NC} )" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️  Teardown cancelled${NC}"
        exit 0
    fi

    echo -e "${BLUE}🗑️  Deleting resource group $RG_NAME...${NC}"
    az group delete --name "$RG_NAME" --yes

    echo -e "${BLUE}⏳ Waiting for deletion to finish...${NC}"
    while az group show --name "$RG_NAME" --output none 2>/dev/null; do
        sleep 10
    done
    echo -e "${GREEN}✓${NC} Resource group deleted"
fi

echo ""
echo -e "${BLUE}🔍 Checking for a soft-deleted Key Vault named $KV_NAME...${NC}"
DELETED_KV=$(az keyvault list-deleted --query "[?name=='$KV_NAME']" --output json)

if [ "$DELETED_KV" = "[]" ]; then
    echo -e "${GREEN}✓${NC} No soft-deleted vault found. Name is free."
    exit 0
fi

PURGE_PROTECTED=$(echo "$DELETED_KV" | jq -r '.[0].properties.purgeProtectionEnabled')
KV_LOCATION=$(echo "$DELETED_KV" | jq -r '.[0].properties.location')

if [ "$PURGE_PROTECTED" = "true" ]; then
    SCHEDULED_PURGE=$(echo "$DELETED_KV" | jq -r '.[0].properties.scheduledPurgeDate')
    echo -e "${RED}⚠️  $KV_NAME is purge-protected and cannot be purged manually.${NC}"
    echo -e "${YELLOW}   It will auto-purge on: $SCHEDULED_PURGE${NC}"
    echo -e "${YELLOW}   Until then, deploy with a suffix to avoid the name conflict:${NC}"
    echo "     ./deploy.sh $ENVIRONMENT northeurope random"
    exit 1
fi

echo -e "${BLUE}🧹 Purging soft-deleted vault $KV_NAME in $KV_LOCATION...${NC}"
az keyvault purge --name "$KV_NAME" --location "$KV_LOCATION"
echo -e "${GREEN}✅ Vault purged. '$KV_NAME' is free to reuse on the next deploy.${NC}"

// Main Bicep Template - Fit Tracker Azure Infrastructure
// Deploys: Storage + CDN, Container Registry, Container Apps, Key Vault, Monitoring
// Architecture: Scale-to-zero with consumption-based pricing

targetScope = 'resourceGroup'

// ============================================
// Parameters
// ============================================

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'prod'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Project name for resource naming')
@minLength(3)
@maxLength(10)
param projectName string = 'fittracker'

@description('Minimum replicas for Container Apps (0 for scale-to-zero)')
@minValue(0)
@maxValue(30)
param containerAppMinReplicas int = 0

@description('Maximum replicas for Container Apps')
@minValue(1)
@maxValue(30)
param containerAppMaxReplicas int = 3

@description('CPU cores per container')
@allowed(['0.25', '0.5', '0.75', '1.0', '1.25', '1.5', '1.75', '2.0'])
param containerCpuCores string = '0.5'

@description('Memory per container')
@allowed(['0.5Gi', '1.0Gi', '1.5Gi', '2.0Gi', '3.0Gi', '4.0Gi'])
param containerMemory string = '1Gi'

@description('Enable custom domain for CDN')
param enableCdnCustomDomain bool = false

@description('Custom domain name for SPA (e.g., fittracker.com)')
param customDomainName string = ''

@description('Custom domain name for API (e.g., api.fittracker.com)')
param apiCustomDomainName string = ''

@description('API base URL (will use Container App FQDN if not provided)')
param apiBaseUrl string = ''

@description('CORS allowed origins (comma-separated)')
param corsAllowedOrigins string = ''

@description('Deploy Azure Container Registry (set to false to save $5/month and use GitHub Container Registry instead)')
param deployAcr bool = true

@description('Container Registry login server (required if deployAcr is false)')
param externalAcrLoginServer string = ''

@description('Resource tags')
param tags object = {
  Project: 'Fit Tracker'
  Environment: environment
  ManagedBy: 'Bicep'
  CostCenter: 'Portfolio'
}

// ============================================
// Variables
// ============================================

var rgName = 'rg-${projectName}-${environment}'
var computedApiBaseUrl = apiBaseUrl != '' ? apiBaseUrl : 'https://${containerApps.outputs.containerAppFqdn}'
var computedCorsOrigins = corsAllowedOrigins != '' ? corsAllowedOrigins : 'https://${customDomainName},capacitor://localhost,ionic://localhost'

// ============================================
// Module: Monitoring (deploy first for Log Analytics)
// ============================================

module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    tags: tags
    dailyDataCapGb: 1 // Stay in free tier
    retentionInDays: 90
  }
}

// ============================================
// Module: Key Vault (deploy early for secrets)
// ============================================

module keyVault './modules/key-vault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    tags: tags
    enablePurgeProtection: environment == 'prod'
    enableSoftDelete: true
    softDeleteRetentionDays: 90
  }
}

// ============================================
// Module: Container Registry (Optional - $5/month)
// ============================================

module containerRegistry './modules/container-registry.bicep' = if (deployAcr) {
  name: 'acr-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    tags: tags
    acrSku: 'Basic' // $5/month
  }
}

// ============================================
// Module: Container Apps
// ============================================

module containerApps './modules/container-apps.bicep' = {
  name: 'containerapps-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    tags: tags
    acrLoginServer: deployAcr ? containerRegistry.outputs.acrLoginServer : externalAcrLoginServer
    acrName: deployAcr ? containerRegistry.outputs.acrName : ''
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    keyVaultName: keyVault.outputs.keyVaultName
    minReplicas: containerAppMinReplicas // 0 for scale-to-zero
    maxReplicas: containerAppMaxReplicas
    cpuCores: containerCpuCores
    memory: containerMemory
    apiBaseUrl: computedApiBaseUrl
    corsAllowedOrigins: computedCorsOrigins
  }
  dependsOn: [
    monitoring
    keyVault
  ]
}

// Grant Container App access to Key Vault (after Container App is created)
module keyVaultAccess './modules/key-vault.bicep' = {
  name: 'keyvault-access-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    tags: tags
    containerAppPrincipalId: containerApps.outputs.containerAppPrincipalId
    enablePurgeProtection: environment == 'prod'
    enableSoftDelete: true
    softDeleteRetentionDays: 90
  }
  dependsOn: [
    containerApps
  ]
}

// ============================================
// Module: Storage + CDN
// ============================================

module storage './modules/storage.bicep' = {
  name: 'storage-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    tags: tags
    enableCustomDomain: enableCdnCustomDomain
    customDomainName: customDomainName
  }
}

// Update monitoring alerts with actual resource IDs
module monitoringAlerts './modules/monitoring.bicep' = {
  name: 'monitoring-alerts-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    tags: tags
    containerAppId: containerApps.outputs.containerAppId
    storageAccountId: storage.outputs.storageAccountId
    dailyDataCapGb: 1
    retentionInDays: 90
  }
  dependsOn: [
    containerApps
    storage
  ]
}

// ============================================
// Outputs
// ============================================

// Storage & CDN
output staticWebsiteUrl string = storage.outputs.staticWebsiteUrl
output cdnEndpointUrl string = storage.outputs.cdnEndpointUrl
output storageAccountName string = storage.outputs.storageAccountName

// Container Apps
output apiUrl string = containerApps.outputs.containerAppUrl
output apiF qdn string = containerApps.outputs.containerAppFqdn
output containerAppName string = containerApps.outputs.containerAppName

// Container Registry (optional)
output acrLoginServer string = deployAcr ? containerRegistry.outputs.acrLoginServer : externalAcrLoginServer
output acrName string = deployAcr ? containerRegistry.outputs.acrName : 'external-registry'
output acrDeployed bool = deployAcr

// Key Vault
output keyVaultName string = keyVault.outputs.keyVaultName
output keyVaultUri string = keyVault.outputs.keyVaultUri

// Monitoring
output appInsightsName string = monitoring.outputs.appInsightsName
output appInsightsConnectionString string = monitoring.outputs.appInsightsConnectionString
output logAnalyticsWorkspaceName string = monitoring.outputs.logAnalyticsWorkspaceName

// Deployment Summary
output deploymentSummary object = {
  resourceGroupName: rgName
  environment: environment
  location: location
  spaUrl: storage.outputs.cdnEndpointUrl
  apiUrl: containerApps.outputs.containerAppUrl
  scaleToZero: containerAppMinReplicas == 0
  estimatedMonthlyCostIdle: '$5-10'
  estimatedMonthlyCostActive100h: '$50-60'
}

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

@description('Optional lowercase alphanumeric suffix appended to resource names, for ephemeral/parallel dev stacks that must not collide with the main deployment')
@maxLength(5)
param resourceSuffix string = ''

@description('Enable Key Vault purge protection (should stay true for prod; disable for dev so deleted vaults can be purged immediately instead of blocking recreation for up to 90 days)')
param enableKeyVaultPurgeProtection bool = true

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
param containerMemory string = '1.0Gi'

@description('Enable Azure CDN (deprecated - disabled by default)')
param enableCdn bool = false

@description('Enable custom domain for CDN')
param enableCdnCustomDomain bool = false

@description('Custom domain name for SPA (e.g., fittracker.com)')
param customDomainName string = ''

@description('Suffix for this revision (e.g. short git SHA), enabling blue-green deploys. Leave empty for an Azure-generated suffix.')
param revisionSuffix string = ''

@description('Container image tag to deploy (CI passes sha-<short>)')
param imageTag string = 'latest'

@description('Name of the revision currently holding the "production" label. See container-apps.bicep for why this exists.')
param currentProductionRevisionName string = ''

@description('API base URL (will use Container App FQDN if not provided)')
param apiBaseUrl string = ''

@description('CORS allowed origins (comma-separated)')
param corsAllowedOrigins string = ''

@description('Canonical web app origin for Stripe Checkout redirects (defaults to https://<customDomainName>)')
param webAppUrl string = ''

@description('Price ID of the one-time credit-pack Price, created in the Stripe Dashboard (test mode)')
param stripeCreditPackPriceId string = ''

@description('Google OAuth web client ID. A public identifier, so it is a plain env var; the client secret comes from Key Vault (GOOGLE-CLIENT-SECRET).')
param googleClientId string = '9802974239-diuva1p8lq4jk2lu0u3aranp1jtlchl6.apps.googleusercontent.com'

@description('Sign in with Apple Services ID (web flow). Public identifier; the private key comes from Key Vault (APPLE-PRIVATE-KEY).')
param appleClientId string = 'com.fivaz.fittracker.web'

@description('Apple Developer Team ID used to sign the Sign in with Apple client secret')
param appleTeamId string = '57D29F8Q9G'

@description('Key ID of the Sign in with Apple .p8 key')
param appleKeyId string = 'K62FM85V5G'

@description('iOS bundle ID, the audience of native Sign in with Apple ID tokens')
param appleAppBundleId string = 'com.fivaz.fittracker'

@description('Deploy Container Apps (set to false for initial infrastructure-only deployment)')
param deployContainerApps bool = true

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
// Use custom API base URL if provided, otherwise empty (Container App will use its default FQDN)
var computedApiBaseUrl = apiBaseUrl
var computedCorsOrigins = corsAllowedOrigins != '' ? corsAllowedOrigins : 'https://${customDomainName},capacitor://localhost,ionic://localhost'
var computedWebAppUrl = webAppUrl != '' ? webAppUrl : (customDomainName != '' ? 'https://${customDomainName}' : '')

// ============================================
// Module: Monitoring (deploy first for Log Analytics)
// ============================================

module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    resourceSuffix: resourceSuffix
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
    resourceSuffix: resourceSuffix
    tags: tags
    enablePurgeProtection: enableKeyVaultPurgeProtection
    enableSoftDelete: true
    softDeleteRetentionDays: 90
    // Only create placeholder secrets on the initial bootstrap deploy (deployContainerApps=false).
    // CI's day-2 deploys must never touch secret values, or they'd wipe the real ones back to placeholders.
    managePlaceholderSecrets: !deployContainerApps
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
    resourceSuffix: resourceSuffix
    tags: tags
    acrSku: 'Basic' // $5/month
  }
}

// ============================================
// Module: Container Apps (Optional - requires Docker image)
// ============================================

module containerApps './modules/container-apps.bicep' = if (deployContainerApps) {
  name: 'containerapps-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    resourceSuffix: resourceSuffix
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
    webAppUrl: computedWebAppUrl
    stripeCreditPackPriceId: stripeCreditPackPriceId
    googleClientId: googleClientId
    appleClientId: appleClientId
    appleTeamId: appleTeamId
    appleKeyId: appleKeyId
    appleAppBundleId: appleAppBundleId
    revisionSuffix: revisionSuffix
    imageTag: imageTag
    currentProductionRevisionName: currentProductionRevisionName
  }
  dependsOn: [
    monitoring
    keyVault
  ]
}

// Grant Container App access to Key Vault (after Container App is created)
module keyVaultAccess './modules/key-vault.bicep' = if (deployContainerApps) {
  name: 'keyvault-access-deployment'
  params: {
    environment: environment
    location: location
    projectName: projectName
    resourceSuffix: resourceSuffix
    tags: tags
    containerAppPrincipalId: containerApps.outputs.containerAppPrincipalId
    enablePurgeProtection: enableKeyVaultPurgeProtection
    enableSoftDelete: true
    softDeleteRetentionDays: 90
    managePlaceholderSecrets: false
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
    resourceSuffix: resourceSuffix
    tags: tags
    enableCdn: enableCdn
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
    resourceSuffix: resourceSuffix
    tags: tags
    containerAppId: deployContainerApps ? containerApps.outputs.containerAppId : ''
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

// Container Apps (conditional)
output apiUrl string = deployContainerApps ? containerApps.outputs.containerAppUrl : 'not-deployed'
output apiFqdn string = deployContainerApps ? containerApps.outputs.containerAppFqdn : 'not-deployed'
output apiRevisionName string = deployContainerApps ? containerApps.outputs.revisionName : 'not-deployed'
output apiCustomDomainVerificationId string = deployContainerApps ? containerApps.outputs.customDomainVerificationId : 'not-deployed'
output containerAppName string = deployContainerApps ? containerApps.outputs.containerAppName : 'not-deployed'

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
  apiUrl: deployContainerApps ? containerApps.outputs.containerAppUrl : 'not-deployed'
  scaleToZero: deployContainerApps && containerAppMinReplicas == 0
  estimatedMonthlyCostIdle: '$5-10'
  estimatedMonthlyCostActive100h: '$50-60'
}

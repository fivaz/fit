// Storage Account with Static Website + Azure CDN
// Hosts the Next.js static SPA export

@description('Environment name (dev, staging, prod)')
param environment string

@description('Azure region for resources')
param location string

@description('Project name for resource naming')
param projectName string

@description('Resource tags')
param tags object = {}

@description('Enable custom domain for CDN')
param enableCustomDomain bool = false

@description('Custom domain name for SPA')
param customDomainName string = ''

@description('Enable Azure CDN (deprecated - use Azure Front Door instead)')
param enableCdn bool = false

// ============================================
// Storage Account for Static Website
// ============================================

var storageAccountName = 'st${projectName}${environment}'
var cdnProfileName = 'cdn-${projectName}-${environment}'
var cdnEndpointName = '${projectName}-${environment}'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS' // Locally redundant storage (cheapest)
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false // Security: disable public blob access
    allowSharedKeyAccess: true // Needed for static website
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// Enable static website hosting
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'HEAD', 'OPTIONS']
          allowedHeaders: ['*']
          exposedHeaders: ['*']
          maxAgeInSeconds: 3600
        }
      ]
    }
  }
}

// $web container for static website
resource webContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: '$web'
  properties: {
    publicAccess: 'None'
  }
}

// ============================================
// Azure CDN (DEPRECATED - Optional, disabled by default)
// Use Azure Front Door or external CDN (Cloudflare) instead
// ============================================

resource cdnProfile 'Microsoft.Cdn/profiles@2023-05-01' = if (enableCdn) {
  name: cdnProfileName
  location: 'Global'
  tags: tags
  sku: {
    name: 'Standard_Akamai'
  }
}

resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2023-05-01' = if (enableCdn) {
  parent: cdnProfile
  name: cdnEndpointName
  location: 'Global'
  tags: tags
  properties: {
    originHostHeader: replace(replace(storageAccount.properties.primaryEndpoints.web, 'https://', ''), '/', '')
    isHttpAllowed: false // HTTPS only
    isHttpsAllowed: true
    queryStringCachingBehavior: 'IgnoreQueryString'
    optimizationType: 'GeneralWebDelivery'
    origins: [
      {
        name: 'storage-origin'
        properties: {
          hostName: replace(replace(storageAccount.properties.primaryEndpoints.web, 'https://', ''), '/', '')
          httpPort: 80
          httpsPort: 443
          originHostHeader: replace(replace(storageAccount.properties.primaryEndpoints.web, 'https://', ''), '/', '')
        }
      }
    ]
    deliveryPolicy: {
      rules: [
        {
          name: 'StaticAssetsCaching'
          order: 1
          conditions: [
            {
              name: 'UrlPath'
              parameters: {
                '@odata.type': '#Microsoft.Azure.Cdn.Models.DeliveryRuleUrlPathMatchConditionParameters'
                operator: 'BeginsWith'
                matchValues: ['/_next/static/']
              }
            }
          ]
          actions: [
            {
              name: 'CacheExpiration'
              parameters: {
                '@odata.type': '#Microsoft.Azure.Cdn.Models.DeliveryRuleCacheExpirationActionParameters'
                cacheBehavior: 'Override'
                cacheType: 'All'
                cacheDuration: '365.00:00:00' // 1 year
              }
            }
          ]
        }
        {
          name: 'NoCacheForHtml'
          order: 2
          conditions: [
            {
              name: 'UrlFileExtension'
              parameters: {
                '@odata.type': '#Microsoft.Azure.Cdn.Models.DeliveryRuleUrlFileExtensionMatchConditionParameters'
                operator: 'Equal'
                matchValues: ['html']
              }
            }
          ]
          actions: [
            {
              name: 'CacheExpiration'
              parameters: {
                '@odata.type': '#Microsoft.Azure.Cdn.Models.DeliveryRuleCacheExpirationActionParameters'
                cacheBehavior: 'Override'
                cacheType: 'All'
                cacheDuration: '00:00:00' // No cache
              }
            }
          ]
        }
      ]
    }
  }
}

// ============================================
// Outputs
// ============================================

output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id
output staticWebsiteUrl string = storageAccount.properties.primaryEndpoints.web
// When CDN is disabled, use static website URL directly
output cdnEndpointUrl string = enableCdn ? 'https://${cdnEndpoint.properties.hostName}' : storageAccount.properties.primaryEndpoints.web
output cdnEndpointName string = enableCdn ? cdnEndpoint.name : 'cdn-disabled'
output cdnProfileName string = enableCdn ? cdnProfile.name : 'cdn-disabled'

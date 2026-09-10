// Azure Container Registry (ACR)
// Private Docker image registry for API container

@description('Environment name (dev, staging, prod)')
param environment string

@description('Azure region for resources')
param location string

@description('Project name for resource naming')
param projectName string

@description('Optional lowercase alphanumeric suffix appended to resource names')
param resourceSuffix string = ''

@description('Resource tags')
param tags object = {}

@description('ACR SKU (Basic, Standard, Premium)')
@allowed(['Basic', 'Standard', 'Premium'])
param acrSku string = 'Basic'

// ============================================
// Container Registry
// ============================================

var acrName = 'acr${projectName}${environment}${resourceSuffix}'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: acrSku
  }
  properties: {
    adminUserEnabled: false // Security: use managed identity instead
    publicNetworkAccess: 'Enabled'
    networkRuleBypassOptions: 'AzureServices'
    zoneRedundancy: 'Disabled' // Not needed for Basic tier
    policies: {
      retentionPolicy: {
        status: 'enabled'
        days: 30 // Keep images for 30 days
      }
      trustPolicy: {
        status: 'disabled'
      }
    }
  }
}

// Webhook for CI/CD notifications (optional)
resource webhook 'Microsoft.ContainerRegistry/registries/webhooks@2023-07-01' = {
  parent: containerRegistry
  name: 'cicdWebhook'
  location: location
  properties: {
    status: 'enabled'
    scope: 'fit-api:*'
    actions: ['push']
    serviceUri: 'https://placeholder.com' // Update with actual webhook URL
  }
}

// ============================================
// Outputs
// ============================================

output acrName string = containerRegistry.name
output acrId string = containerRegistry.id
output acrLoginServer string = containerRegistry.properties.loginServer

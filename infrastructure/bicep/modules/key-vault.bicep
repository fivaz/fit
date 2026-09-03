// Azure Key Vault
// Secure secrets management with managed identity access

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

@description('Container App managed identity principal ID')
param containerAppPrincipalId string = ''

@description('Enable purge protection (recommended for production)')
param enablePurgeProtection bool = true

@description('Enable soft delete (recommended for production)')
param enableSoftDelete bool = true

@description('Soft delete retention days')
@minValue(7)
@maxValue(90)
param softDeleteRetentionDays int = 90

// ============================================
// Key Vault
// ============================================

var nameSuffix = empty(resourceSuffix) ? '' : '-${resourceSuffix}'
var keyVaultName = 'kv-${projectName}-${environment}${nameSuffix}'

// The Key Vault API rejects an explicit "enablePurgeProtection: false" (only
// "true" or omitting the property are valid), so it's spliced in conditionally.
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: union(
    {
      tenantId: subscription().tenantId
      sku: {
        family: 'A'
        name: 'standard' // Standard tier (no HSM needed)
      }
      enabledForDeployment: false
      enabledForDiskEncryption: false
      enabledForTemplateDeployment: true
      enableSoftDelete: enableSoftDelete
      softDeleteRetentionInDays: softDeleteRetentionDays
      enableRbacAuthorization: true // Use RBAC instead of access policies
      publicNetworkAccess: 'Enabled'
      networkAcls: {
        defaultAction: 'Allow'
        bypass: 'AzureServices'
        ipRules: []
        virtualNetworkRules: []
      }
    },
    enablePurgeProtection ? { enablePurgeProtection: true } : {}
  )
}

// Grant Container App managed identity permission to read secrets
resource secretsUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (containerAppPrincipalId != '') {
  name: guid(keyVault.id, containerAppPrincipalId, 'SecretsUser')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalId: containerAppPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// ============================================
// Placeholder Secrets (to be populated manually)
// ============================================

// Note: Actual secret values should be set via Azure Portal, CLI, or CI/CD
// These are just placeholders to create the secret entries

resource databaseUrlSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'DATABASE-URL'
  properties: {
    value: 'placeholder-update-via-portal-or-cli'
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

resource betterAuthSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'BETTER-AUTH-SECRET'
  properties: {
    value: 'placeholder-update-via-portal-or-cli'
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

resource openAiKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'OPENAI-API-KEY'
  properties: {
    value: 'placeholder-update-via-portal-or-cli'
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

resource googleClientIdSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'GOOGLE-CLIENT-ID'
  properties: {
    value: 'placeholder-update-via-portal-or-cli'
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

resource googleClientSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'GOOGLE-CLIENT-SECRET'
  properties: {
    value: 'placeholder-update-via-portal-or-cli'
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

resource githubClientIdSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'GITHUB-CLIENT-ID'
  properties: {
    value: 'placeholder-update-via-portal-or-cli'
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

resource githubClientSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'GITHUB-CLIENT-SECRET'
  properties: {
    value: 'placeholder-update-via-portal-or-cli'
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

// ============================================
// Outputs
// ============================================

output keyVaultName string = keyVault.name
output keyVaultId string = keyVault.id
output keyVaultUri string = keyVault.properties.vaultUri

// Azure Container Apps with Scale-to-Zero
// Hosts the NestJS API with consumption-based billing

@description('Environment name (dev, staging, prod)')
param environment string

@description('Azure region for resources')
param location string

@description('Project name for resource naming')
param projectName string

@description('Resource tags')
param tags object = {}

@description('Container Registry login server')
param acrLoginServer string

@description('Container Registry name')
param acrName string

@description('Log Analytics workspace ID for monitoring')
param logAnalyticsWorkspaceId string

@description('Key Vault name for secrets')
param keyVaultName string

@description('Minimum replicas (0 for scale-to-zero)')
@minValue(0)
@maxValue(30)
param minReplicas int = 0

@description('Maximum replicas')
@minValue(1)
@maxValue(30)
param maxReplicas int = 3

@description('CPU cores per container')
param cpuCores string = '0.5'

@description('Memory per container')
param memory string = '1Gi'

@description('API base URL (e.g., https://api.fittracker.com)')
param apiBaseUrl string

@description('CORS allowed origins (comma-separated)')
param corsAllowedOrigins string = 'https://fittracker.com,capacitor://localhost'

// ============================================
// Container Apps Environment
// ============================================

var containerAppEnvName = 'cae-${projectName}-${environment}'
var containerAppName = 'ca-${projectName}-api-${environment}'

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsWorkspaceId, '2022-10-01').customerId
        sharedKey: listKeys(logAnalyticsWorkspaceId, '2022-10-01').primarySharedKey
      }
    }
    zoneRedundant: false // Not needed for portfolio, saves cost
  }
}

// ============================================
// Container App (API)
// ============================================

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned' // Managed identity for ACR pull and Key Vault access
  }
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single' // Only one revision active at a time
      ingress: {
        external: true // Public internet access
        targetPort: 3001
        transport: 'http'
        allowInsecure: false // HTTPS only
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: acrName != '' ? [
        {
          server: acrLoginServer
          identity: 'system' // Use managed identity for Azure ACR pull
        }
      ] : [] // No registry config needed for public registries like ghcr.io
      secrets: [
        {
          name: 'database-url'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/DATABASE-URL'
          identity: 'system'
        }
        {
          name: 'better-auth-secret'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/BETTER-AUTH-SECRET'
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'fit-api'
          image: '${acrLoginServer}/fit-api:latest' // Will be updated by CI/CD
          resources: {
            cpu: json(cpuCores)
            memory: memory
          }
          env: [
            {
              name: 'DATABASE_URL'
              secretRef: 'database-url'
            }
            {
              name: 'BETTER_AUTH_SECRET'
              secretRef: 'better-auth-secret'
            }
            {
              name: 'API_BASE_URL'
              value: apiBaseUrl
            }
            {
              name: 'BETTER_AUTH_URL'
              value: apiBaseUrl
            }
            {
              name: 'CORS_ALLOWED_ORIGINS'
              value: corsAllowedOrigins
            }
            {
              name: 'API_PORT'
              value: '3001'
            }
            {
              name: 'NODE_ENV'
              value: 'production'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: 3001
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 10
              failureThreshold: 3
              timeoutSeconds: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 3001
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 5
              failureThreshold: 3
              timeoutSeconds: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas // CRITICAL: 0 for scale-to-zero
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10' // 10 concurrent requests per instance
              }
            }
          }
        ]
      }
    }
  }
}

// Grant Container App managed identity permission to pull from ACR (only if using Azure ACR)
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (acrName != '') {
  name: guid(containerApp.id, acrName, 'AcrPull')
  scope: resourceId('Microsoft.ContainerRegistry/registries', acrName)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull role
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ============================================
// Outputs
// ============================================

output containerAppName string = containerApp.name
output containerAppId string = containerApp.id
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output containerAppPrincipalId string = containerApp.identity.principalId
output containerAppEnvironmentName string = containerAppEnvironment.name

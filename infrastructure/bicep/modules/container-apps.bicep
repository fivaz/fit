// Azure Container Apps with Scale-to-Zero
// Hosts the NestJS API with consumption-based billing

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

@description('Suffix for this revision (e.g. short git SHA). Enables blue-green: the revision provisions with zero traffic until the "production" label is moved to it via `az containerapp revision label add`.')
param revisionSuffix string = ''

@description('Name of the revision currently holding the "production" label. CI reads this from live state before each deploy. Empty means bootstrap mode (no revision holds the label yet — route by latestRevision instead, since ARM rejects a traffic weight with a label but no revisionName). Non-empty pins traffic at that revision, leaving the newly-deployed revision at 0% until CI\'s post-deploy cutover step re-points the label (and this parameter, next run) at it.')
param currentProductionRevisionName string = ''

// ============================================
// Container Apps Environment
// ============================================

var nameSuffix = empty(resourceSuffix) ? '' : '-${resourceSuffix}'
var containerAppEnvName = 'cae-${projectName}-${environment}${nameSuffix}'
var containerAppName = 'ca-${projectName}-api-${environment}${nameSuffix}'

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
//
// The API custom domain (managed certificate + ingress.customDomains binding) is
// intentionally NOT managed here. `az deployment group what-if` proved that ARM replaces
// containerApps' `ingress` object wholesale on every deploy — even omitting the
// `customDomains` key entirely still clears an existing binding, it doesn't preserve it.
// So, like the storage account's custom domain, this stays a purely imperative, idempotent
// step in azure-deploy.yml (`az containerapp hostname add`/`hostname bind`, re-run after
// every Bicep deploy, cheap no-op once already bound) — see README's bootstrap runbook.
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
      activeRevisionsMode: 'Multiple' // Enables blue-green: new revisions provision with 0% traffic until labeled
      ingress: {
        external: true // Public internet access
        targetPort: 3001
        transport: 'http'
        allowInsecure: false // HTTPS only
        // Traffic stays pinned at whichever revision currently holds the "production" label,
        // not whatever deployed most recently — that's what lets the blue-green cutover
        // (azure-deploy.yml's containerapp-bluegreen-cutover action) smoke-test the new
        // revision at 0% traffic before moving the label. currentProductionRevisionName empty
        // is CI's bootstrap escape hatch for the one deploy where nothing holds that label yet
        // (see the param description — ARM rejects label without an explicit revisionName).
        traffic: empty(currentProductionRevisionName) ? [
          {
            latestRevision: true
            weight: 100
          }
        ] : [
          {
            revisionName: currentProductionRevisionName
            label: 'production'
            weight: 100
          }
        ]
        // customDomains is deliberately absent — see the comment above the containerApp
        // resource. Bound imperatively in CI, not here.
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
      revisionSuffix: empty(revisionSuffix) ? null : revisionSuffix
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
              name: 'BETTER_AUTH_TRUSTED_ORIGINS'
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

// Reference existing ACR if name is provided
resource existingAcr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' existing = if (acrName != '') {
  name: acrName
}

// Grant Container App managed identity permission to pull from ACR (only if using Azure ACR)
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (acrName != '') {
  name: guid(containerApp.id, acrName, 'AcrPull')
  scope: existingAcr
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
// Name of the revision just deployed (empty-suffix deploys get an Azure-generated suffix instead,
// visible only after deployment — pass revisionSuffix explicitly to make this predictable for CI).
output revisionName string = empty(revisionSuffix) ? '' : '${containerAppName}--${revisionSuffix}'
output customDomainVerificationId string = containerApp.properties.customDomainVerificationId

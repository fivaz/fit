// Application Insights + Log Analytics
// Monitoring, logging, and alerting for the application

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

@description('Container App ID for alert rules')
param containerAppId string = ''

@description('Storage Account ID for alert rules')
param storageAccountId string = ''

@description('Daily data cap in GB (0 = no cap)')
@minValue(0)
param dailyDataCapGb int = 1 // Free tier limit

@description('Data retention in days')
@minValue(30)
@maxValue(730)
param retentionInDays int = 90

// ============================================
// Log Analytics Workspace
// ============================================

var nameSuffix = empty(resourceSuffix) ? '' : '-${resourceSuffix}'
var logAnalyticsName = 'log-${projectName}-${environment}${nameSuffix}'
var appInsightsName = 'appi-${projectName}-${environment}${nameSuffix}'
var actionGroupName = 'ag-${projectName}-${environment}${nameSuffix}'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018' // Pay-per-GB pricing
    }
    retentionInDays: retentionInDays
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: dailyDataCapGb
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ============================================
// Application Insights
// ============================================

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    RetentionInDays: retentionInDays
    SamplingPercentage: 10 // 10% sampling to reduce data volume
  }
}

// ============================================
// Action Group (for alerts)
// ============================================

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: actionGroupName
  location: 'Global'
  tags: tags
  properties: {
    groupShortName: substring(projectName, 0, min(length(projectName), 12))
    enabled: true
    emailReceivers: [
      {
        name: 'NotifyAdmin'
        emailAddress: 'admin@example.com' // Update with actual email
        useCommonAlertSchema: true
      }
    ]
  }
}

// ============================================
// Alert Rules
// ============================================

// Alert: Container App Response Time > 2s
resource responseTimeAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (containerAppId != '') {
  name: 'alert-api-response-time-${environment}${nameSuffix}'
  location: 'Global'
  tags: tags
  properties: {
    description: 'Alerts when API response time exceeds 2 seconds'
    severity: 2 // Warning
    enabled: true
    scopes: [
      containerAppId
    ]
    evaluationFrequency: 'PT5M' // Every 5 minutes
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          criterionType: 'StaticThresholdCriterion'
          name: 'ResponseTimeHigh'
          metricName: 'ResponseTime'
          metricNamespace: 'Microsoft.App/containerApps'
          operator: 'GreaterThan'
          threshold: 2000 // 2 seconds in ms
          timeAggregation: 'Average'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// Alert: Container App Error Rate > 5%
resource errorRateAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (containerAppId != '') {
  name: 'alert-api-error-rate-${environment}${nameSuffix}'
  location: 'Global'
  tags: tags
  properties: {
    description: 'Alerts when API error rate exceeds 5%'
    severity: 1 // Error
    enabled: true
    scopes: [
      containerAppId
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          criterionType: 'StaticThresholdCriterion'
          name: 'ErrorRateHigh'
          metricName: 'Requests'
          metricNamespace: 'Microsoft.App/containerApps'
          dimensions: [
            {
              name: 'statusCodeCategory'
              operator: 'Include'
              values: ['5xx']
            }
          ]
          operator: 'GreaterThan'
          threshold: 5
          timeAggregation: 'Count'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// Alert: Storage Account Availability < 99.9%
resource storageAvailabilityAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (storageAccountId != '') {
  name: 'alert-storage-availability-${environment}${nameSuffix}'
  location: 'Global'
  tags: tags
  properties: {
    description: 'Alerts when storage availability drops below 99.9%'
    severity: 1 // Error
    enabled: true
    scopes: [
      storageAccountId
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          criterionType: 'StaticThresholdCriterion'
          name: 'AvailabilityLow'
          metricName: 'Availability'
          metricNamespace: 'Microsoft.Storage/storageAccounts'
          operator: 'LessThan'
          threshold: 99
          timeAggregation: 'Average'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// ============================================
// Outputs
// ============================================

output logAnalyticsWorkspaceId string = logAnalytics.id
output logAnalyticsWorkspaceName string = logAnalytics.name
output logAnalyticsCustomerId string = logAnalytics.properties.customerId
output appInsightsName string = appInsights.name
output appInsightsId string = appInsights.id
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output actionGroupId string = actionGroup.id

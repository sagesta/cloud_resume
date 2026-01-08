// Default to 'eastus2' which usually has better availability for Student/Free tiers
param location string = 'eastus2' 
param appName string = 'sagesta-resume'

// 1. Create a clean variable for Storage (Remove dashes, lowercase only)
// uniqueString uses the Resource Group ID to ensure this name is unique globally
var storageName = 'st${replace(appName, '-', '')}${uniqueString(resourceGroup().id)}'

// 2. Storage Account
resource storage 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: take(storageName, 24) // Ensure it doesn't exceed 24 chars
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2022-09-01' = {
  parent: storage
  name: 'default'
  properties: {}
}

// 3. Cosmos DB
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: '${appName}-db'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosAccount
  name: 'ResumeDB'
  properties: {
    resource: {
      id: 'ResumeDB'
    }
  }
}

resource container 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: database
  name: 'Counter'
  properties: {
    resource: {
      id: 'Counter'
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
      }
    }
  }
}

// 4. Azure Function
resource hostingPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'Y1' 
    tier: 'Dynamic'
  }
  properties: {}
}

resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: '${appName}-func'
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    siteConfig: {
      linuxFxVersion: 'Python|3.11'
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storage.listKeys().keys[0].value}'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'python'
        }
        {
          name: 'CosmosDbConnectionString'
          value: cosmosAccount.listConnectionStrings().connectionStrings[0].connectionString
        }
      ]
      cors: {
        allowedOrigins: [
          'https://samueladebodun.com' 
          'http://localhost:4321'
        ]
      }
    }
    httpsOnly: true
  }
}

output storageEndpoint string = storage.properties.primaryEndpoints.web
output functionAppName string = functionApp.name
// Important: Output the generated storage name so we can use it in GitHub Actions
output storageAccountName string = storage.name
param location string = resourceGroup().location
param appName string = 'sagesta-resume' // Change this to be unique!

// 1. Storage Account for Static Website
resource storage 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: '${appName}st'
  location: location
  sku: {
    name: 'Standard_LRS' // Cheapest redundancy
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
  }
}

// Enable Static Website (This is a sub-resource trick in Bicep)
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2022-09-01' = {
  parent: storage
  name: 'default'
  properties: {}
}

// 2. Cosmos DB (Serverless for cost efficiency or Free Tier)
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
    // "EnableFreeTier": true // Uncomment if you haven't used your 1 free tier yet!
    capabilities: [
      {
        name: 'EnableServerless' // Pay only for what you use (very cheap for resumes)
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

// 3. Azure Function (Python)
resource hostingPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'Y1' 
    tier: 'Dynamic' // Consumption plan (Pay-as-you-go, usually free for low traffic)
  }
  properties: {}
}

resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: '${appName}-func'
  location: location
  kind: 'functionapp,linux' // Linux is required for Python
  properties: {
    serverFarmId: hostingPlan.id
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11' // Ensure matches your local python version
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
          'https://samueladebodun.com' // Replace with your actual domain later
          'http://localhost:4321'   // For local testing
        ]
      }
    }
    httpsOnly: true
  }
}

// Outputs to help us later
output storageEndpoint string = storage.properties.primaryEndpoints.web
output functionAppName string = functionApp.name
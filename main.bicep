@minLength(3)
@maxLength(24)
param storageAccountName string
param location string = resourceGroup().location

@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
  'Standard_ZRS'
  'Premium_LRS'
])
param skuName string = 'Standard_LRS'

resource stg 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: skuName
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
  }
}

output storageId string = stg.id

// --- Azure Front Door Standard/Premium ---

@description('The name of the Front Door profile')
param frontDoorProfileName string = 'fd-${uniqueString(resourceGroup().id)}'

@description('The name of the Front Door endpoint')
param frontDoorEndpointName string = 'fde-${uniqueString(resourceGroup().id)}'

@description('The name of the DNS zone')
param dnsZoneName string = 'samueladebodun.com'

@description('The subdomain to use (e.g. www)')
param subDomain string = 'www'

var fullCustomDomainName = '${subDomain}.${dnsZoneName}'
var customDomainResourceName = replace(fullCustomDomainName, '.', '-')

resource frontDoorProfile 'Microsoft.Cdn/profiles@2021-06-01' = {
  name: frontDoorProfileName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
}

resource frontDoorEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2021-06-01' = {
  parent: frontDoorProfile
  name: frontDoorEndpointName
  location: 'global'
  properties: {
    enabledState: 'Enabled'
  }
}

resource frontDoorOriginGroup 'Microsoft.Cdn/profiles/originGroups@2021-06-01' = {
  parent: frontDoorProfile
  name: 'default-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Http'
      probeIntervalInSeconds: 100
    }
  }
}

resource frontDoorOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2021-06-01' = {
  parent: frontDoorOriginGroup
  name: 'default-origin'
  properties: {
    hostName: replace(replace(stg.properties.primaryEndpoints.web, 'https://', ''), '/', '')
    httpPort: 80
    httpsPort: 443
    originHostHeader: replace(replace(stg.properties.primaryEndpoints.web, 'https://', ''), '/', '')
    priority: 1
    weight: 1000
  }
}

// Custom Domain Resource on Front Door
resource frontDoorCustomDomain 'Microsoft.Cdn/profiles/customDomains@2021-06-01' = {
  parent: frontDoorProfile
  name: customDomainResourceName
  properties: {
    hostName: fullCustomDomainName
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

resource frontDoorRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2021-06-01' = {
  parent: frontDoorEndpoint
  name: 'default-route'
  dependsOn: [
    frontDoorOrigin
  ]
  properties: {
    customDomains: [
      {
        id: frontDoorCustomDomain.id
      }
    ]
    originGroup: {
      id: frontDoorOriginGroup.id
    }
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/*'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
  }
}

// --- Azure DNS Automation ---

resource dnsZone 'Microsoft.Network/dnsZones@2018-05-01' existing = {
  name: dnsZoneName
}

// TXT Record for Validation (_dnsauth.subdomain)
resource dnsTxtRecord 'Microsoft.Network/dnsZones/TXT@2018-05-01' = {
  parent: dnsZone
  name: '_dnsauth.${subDomain}'
  properties: {
    TTL: 3600
    TXTRecords: [
      {
        value: [
          frontDoorCustomDomain.properties.validationProperties.validationToken
        ]
      }
    ]
  }
}

// CNAME Record (www -> Front Door Endpoint)
resource dnsCnameRecord 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = {
  parent: dnsZone
  name: subDomain
  dependsOn: [
    frontDoorRoute // Ensure route is ready
    dnsTxtRecord   // Ensure validation record exists
  ]
  properties: {
    TTL: 3600
    CNAMERecord: {
      cname: frontDoorEndpoint.properties.hostName
    }
  }
}

output frontDoorEndpointHostName string = frontDoorEndpoint.properties.hostName
output customDomainName string = fullCustomDomainName


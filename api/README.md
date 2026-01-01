# API

This directory contains the Azure Functions for the visitor counter.

## Functions

- `GetVisitorCount`: Retrieves the current visitor count from Cosmos DB.
- `SetVisitorCount`: Increments the visitor count in Cosmos DB.
- `HealthCheck`: A simple health check endpoint.

## Deployment

The functions are deployed as part of the `deploy_infra` script. The `main.bicep` file defines the Function App and the necessary settings.

## Usage

The `VisitorCounter.svelte` component in the frontend uses the `SetVisitorCount` function to increment and retrieve the visitor count. The API URL is configured via the `PUBLIC_VISITOR_API_URL` environment variable.

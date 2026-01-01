# Fixing the Visitor Counter 500 Error

The 500 error you are seeing from the `GetVisitorCount` Azure Function is very likely caused by a misconfiguration of the connection string for your Cosmos DB database. The function is trying to read and write to a Cosmos DB, and if it can't connect, it will fail with a generic 500 error.

Here's how to troubleshoot and fix this issue:

## 1. Check the `CosmosDbConnection` Application Setting in Azure

The most common cause of this error is a missing or incorrect `CosmosDbConnection` application setting in your Azure Function App. This setting holds the connection string that allows the function to connect to your Cosmos DB account.

**How to fix:**

1.  Go to the [Azure Portal](https://portal.azure.com).
2.  Navigate to your Function App.
3.  Under **Settings**, click on **Configuration**.
4.  In the **Application settings** section, look for a setting named `CosmosDbConnection`.
5.  **If it doesn't exist:**
    *   Click **New application setting**.
    *   **Name:** `CosmosDbConnection`
    *   **Value:** Paste your Cosmos DB connection string here. You can get this from your Cosmos DB account page in the Azure portal under **Keys**. Use one of the **PRIMARY CONNECTION STRING** values.
6.  **If it does exist:**
    *   Ensure that the value is the correct connection string for your Cosmos DB account.
7.  Click **Save**.

**Important:** After saving the new application setting, you may need to restart your Function App for the changes to take effect.

## 2. Ensure Your Cosmos DB is Set Up Correctly

The function is configured to use a database named `ResumeDB` and a collection named `Visitors`.

**How to check:**

1.  In the Azure Portal, go to your Cosmos DB account.
2.  Use the **Data Explorer** to verify that:
    *   A database named `ResumeDB` exists.
    *   A container (collection) named `Visitors` exists within the `ResumeDB` database.
3.  The function is trying to read a document with `id` of `1` and a `partitionKey` of `1`. The `createIfNotExists` setting for the output binding is `false`, so the `Visitors` container must exist. The function will create the document with `id: "1"` if it does not exist.

## 3. Firewall Rules

Check the firewall settings on your Cosmos DB account. If you have a firewall enabled, make sure that it's configured to allow access from Azure services.

## 4. Code Change for Better Logging

I have modified the `api/GetVisitorCount/index.js` file to add more detailed logging. This will help you diagnose the issue if the problem is not the connection string. The function will now log the `inputDocument` it receives from Cosmos DB. If the `inputDocument` is `null`, it will log a warning.

After you've checked your `CosmosDbConnection` setting, you can check the function's logs in the **Monitor** tab of your Function App in the Azure Portal to see what's being logged. This can provide more clues about what's going wrong.

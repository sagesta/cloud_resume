# Like Button Backend Instructions

To make the like button work, you need a backend to store the counts. Since you are building a Cloud Resume/Portfolio, using **Azure Functions** and **Azure Cosmos DB** (or Table Storage) is a great choice that fits the theme.

## 1. Architecture
- **Frontend**: The `LikeButton` component in your Astro blog calls an API endpoint.
- **API**: An Azure Function (HTTP Trigger) receives the request.
- **Database**: Azure Cosmos DB (NoSQL) stores the like counts for each post.

## 2. Azure Function Code
Here is the complete code for an Azure Function (Node.js v18+) that handles both getting and updating likes.

**`src/functions/likes.js`**
```javascript
const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

// Connection string from environment variables
const COSMOS_CONNECTION_STRING = process.env.COSMOS_CONNECTION_STRING;
const DATABASE_ID = 'BlogDB';
const CONTAINER_ID = 'Likes';

const client = new CosmosClient(COSMOS_CONNECTION_STRING);

app.http('likes', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const id = request.query.get('id');

        if (!id) {
            return { status: 400, body: "Missing 'id' parameter" };
        }

        const container = client.database(DATABASE_ID).container(CONTAINER_ID);

        try {
            if (request.method === 'GET') {
                // Fetch likes
                const { resource } = await container.item(id, id).read();
                return { jsonBody: { likes: resource ? resource.count : 0 } };
            } 
            else if (request.method === 'POST') {
                // Increment likes
                // Note: In a real high-concurrency app, use a stored procedure or optimistic concurrency.
                // For a personal blog, read-modify-write is usually fine.
                
                let { resource } = await container.item(id, id).read();
                
                if (!resource) {
                    resource = { id: id, count: 1 };
                } else {
                    resource.count += 1;
                }

                const { resource: updated } = await container.items.upsert(resource);
                return { jsonBody: { likes: updated.count } };
            }
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Internal Server Error" };
        }
    }
});
```

## 3. Setup Steps

1.  **Create an Azure Function App** in the Azure Portal (Node.js runtime).
2.  **Create an Azure Cosmos DB** account (Core/SQL API).
    - Create a Database named `BlogDB`.
    - Create a Container named `Likes` with Partition Key `/id`.
3.  **Get the Connection String** from your Cosmos DB resource.
4.  **Configure Application Settings** in your Function App:
    - Add `COSMOS_CONNECTION_STRING` with the value you copied.
    - Add `CORS` settings to allow your blog's domain (e.g., `https://your-blog.com`) or `*` for testing.
5.  **Deploy the code** to your Function App.
6.  **Update your frontend**:
    - Build your frontend with the API URL pointing to your function:
      `PUBLIC_API_URL=https://<your-func-app>.azurewebsites.net/api npm run build`

## 4. Local Testing
To test this locally without Azure, you can use the Azure Functions Core Tools `func start` and the Cosmos DB Emulator, or just Mock the data in the `LikeButton.svelte` file temporarily.

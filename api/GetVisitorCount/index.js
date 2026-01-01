module.exports = async function (context, req) {
    context.log('Starting Manual Cosmos DB Operation...');

    try {
        // Debugging: catch module loading errors
        let CosmosClient;
        try {
            CosmosClient = require("@azure/cosmos").CosmosClient;
        } catch (err) {
            throw new Error("Failed to load @azure/cosmos. node_modules likely missing on server. Details: " + err.message);
        }

        // 1. Get Connection String
        const connectionString = process.env.CosmosDbConnection;
        if (!connectionString) {
            throw new Error("Environment variable 'CosmosDbConnection' is missing.");
        }

        // 2. Initialize Client
        const client = new CosmosClient(connectionString);

        // 3. Get Container Reference
        const database = client.database("ResumeDB");
        const container = database.container("Visitors");

        context.log("Connected to Container: Visitors");

        // 4. Read the Item (ID="1", PartitionKey="1")
        const itemRef = container.item("1", "1");
        let { resource: doc } = await itemRef.read();

        // 5. Handle "Not Found" case (Self-Seeding)
        if (!doc) {
            context.log("Item '1' not found. Creating it...");
            const newDoc = { id: "1", count: 1 }; // Start at 1
            const { resource: created } = await container.items.create(newDoc);

            context.res = { body: { count: created.count } };
            return;
        }

        // 6. Increment and Update
        doc.count = (doc.count || 0) + 1;
        const { resource: updated } = await itemRef.replace(doc);

        context.log(`Updated count to: ${updated.count}`);

        context.res = {
            body: {
                count: updated.count
            }
        };

    } catch (error) {
        context.log.error("Fatal Error:", error);
        context.res = {
            status: 500,
            body: "SDK Error: " + error.message + "\nStack: " + error.stack
        };
    }
};

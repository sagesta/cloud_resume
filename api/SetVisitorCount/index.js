const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.CosmosDbConnectionString;
const client = new CosmosClient(connectionString);
const container = client.database("cloud_resume").container("visitor_count");

module.exports = async (context, _req) => {
	context.log("JavaScript HTTP trigger function processed a request.");

	const maxRetries = 5;
	let attempt = 0;

	while (attempt < maxRetries) {
		try {
			// 1. Read the Item
			const { resource: item } = await container.item("1", "1").read();

			if (!item) {
				// Should not happen if DB is seeded, but handle it
				const newItem = { id: "1", count: 1 };
				await container.items.create(newItem);
				context.res = { body: newItem };
				return;
			}

			// 2. Increment
			item.count = (item.count || 0) + 1;

			// 3. Try to Replace (Optimistic Concurrency)
			const { resource: updatedItem } = await container
				.item("1", "1")
				.replace(item, {
					accessCondition: { type: "IfMatch", condition: item._etag },
				});

			context.res = { body: updatedItem };
			return;
		} catch (err) {
			if (err.code === 412) {
				// Precondition Failed - ETag mismatch (someone else updated it)
				attempt++;
				context.log.warn(
					`Conflict detected (412), retrying... Attempt ${attempt}`,
				);
				// Wait a bit before retrying (exponential backoff not strictly needed for low contention but good practice)
				await new Promise((resolve) => setTimeout(resolve, 50 * 2 ** attempt));
			} else {
				context.log.error("Error updating visitor count:", err);
				context.res = { status: 500, body: "Internal Server Error" };
				return;
			}
		}
	}

	context.res = { status: 500, body: "Max retries exceeded" };
};

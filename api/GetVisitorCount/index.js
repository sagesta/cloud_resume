module.exports = async function (context, req, inputDocument) {
    try {
        context.log('JavaScript HTTP trigger function processed a request.');

        let currentCount = 0;

        // Input is now a single Object (Point Read)
        if (inputDocument) {
            currentCount = inputDocument.count;
        }

        const newCount = currentCount + 1;

        // Output to Cosmos DB to update the count
        context.bindings.outputDocument = {
            id: "1",
            count: newCount
        };

        // Response body
        context.res = {
            body: {
                count: newCount
            }
        };

    } catch (error) {
        context.log.error("Error updating visitor count:", error);
        context.res = {
            status: 500,
            body: "Internal Server Error Details: " + error.message + " | Stack: " + error.stack
        };
    }
};

module.exports = async function (context, req, inputDocument) {
    try {
        context.log('JavaScript HTTP trigger function processed a request.');

        // Hardcoded for debugging
        const newCount = 999;

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

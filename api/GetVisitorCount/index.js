module.exports = async function (context, req) {
    context.log("Method Started: GetVisitorCount");

    try {
        // 1. Get the current document from the input binding
        let currentDoc = context.bindings.inputDoc;
        context.log("Input Document:", currentDoc ? JSON.stringify(currentDoc) : "NULL (Document not found)");

        if (!currentDoc) {
            context.log("Document not found, creating new one...");
            currentDoc = {
                id: "1",
                count: 0
            };
        }

        // 2. Increment the count
        currentDoc.count = currentDoc.count + 1;
        context.log("New Count:", currentDoc.count);

        // 3. Save the updated document back to the database
        context.bindings.outputDoc = currentDoc;
        context.log("Assigned to outputDoc binding");

        // 4. Return the count to the user
        context.res = {
            status: 200,
            body: {
                count: currentDoc.count
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
        context.log("Response prepared successfully");

    } catch (error) {
        context.log.error("Fatal Error in GetVisitorCount:", error);
        context.res = {
            status: 500,
            body: {
                error: "Internal Server Error",
                details: error.message,
                stack: error.stack
            }
        };
    }
}

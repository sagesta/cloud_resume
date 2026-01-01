module.exports = async function (context, req, inputDocument) {
    context.log('JavaScript HTTP trigger function processed a request.');

    let currentCount = 0;

    if (inputDocument) {
        currentCount = inputDocument.count;
    }

    const newCount = currentCount + 1;

    // Response body
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {
            count: newCount
        }
    };

    // Output to Cosmos DB to update the count
    context.bindings.outputDocument = {
        id: "1",
        count: newCount,
        partitionKey: "1"
    };
}

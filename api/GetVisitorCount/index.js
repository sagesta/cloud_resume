module.exports = async function (context, req) {
    // 1. Get the current document from the input binding
    // If the item doesn't exist yet, this will be undefined/null
    let currentDoc = context.bindings.inputDoc;

    if (!currentDoc) {
        // If it's missing, initialize it!
        context.log("Document not found, creating new one...");
        currentDoc = {
            id: "1",      // This MUST match the id expected by your partition key
            count: 0
        };
    }

    // 2. Increment the count
    currentDoc.count = currentDoc.count + 1;

    // 3. Save the updated document back to the database (Output Binding)
    // The name 'outputDoc' must match the "name" in your function.json output binding
    context.bindings.outputDoc = currentDoc;

    // 4. Return the count to the user
    context.res = {
        body: {
            count: currentDoc.count
        }
    };
}

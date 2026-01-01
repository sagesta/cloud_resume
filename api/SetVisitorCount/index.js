module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const visitorCount = {
        id: "1",
        count: 1
    };

    const previousVisitorCount = context.bindings.inputDocument;

    if (previousVisitorCount) {
        visitorCount.count = previousVisitorCount.count + 1;
    }

    context.bindings.visitorCount = visitorCount;

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: visitorCount
    };
}
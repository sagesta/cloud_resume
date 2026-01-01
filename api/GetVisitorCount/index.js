module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const visitorCount = context.bindings.visitorCount;

    if (visitorCount) {
        context.res = {
            body: visitorCount
        };
    } else {
        context.res = {
            status: 404,
            body: "Visitor count not found"
        };
    }
}

module.exports = async function (context, req) {
    context.log('HealthCheck triggered.');
    context.res = {
        body: "OK. Function Runtime is healthy."
    };
};

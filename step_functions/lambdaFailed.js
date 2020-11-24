const logIndicator = `______________________________________`
exports.handler = (event, context, callback) => {
    console.log(`${logIndicator} lambdaZ-Failed - Event : ${JSON.stringify(event)}`)
    callback(null, event);
};
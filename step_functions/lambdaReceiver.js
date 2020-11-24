const logIndicator = `______________________________________`
exports.handler = (event, context, callback) => {
    console.log(`${logIndicator} lambdaReceiver - Event : ${JSON.stringify(event)}`)
    callback(null, event);
};
const logIndicator = `______________________________________`
exports.handler = (event, context, callback) => {
    console.log(`${logIndicator} lambdaStarter - Event : ${JSON.stringify(event)}`)
    event.isValid=1
    callback(null, event);
};
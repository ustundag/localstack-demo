const logIndicator = `-----------`
exports.handler = (event, context, callback) => {
    console.log(`${logIndicator} lambdaFailed - Event : ${JSON.stringify(event)}`)
    callback(null, event);
};
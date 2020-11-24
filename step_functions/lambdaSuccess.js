const logIndicator = `-----------`
exports.handler = (event, context, callback) => {
    console.log(`${logIndicator} lambdaSuccess - Event : ${JSON.stringify(event)}`)
    callback(null, event);
};
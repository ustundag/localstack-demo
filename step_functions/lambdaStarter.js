const logIndicator = `-----------`
exports.handler = (event, context, callback) => {
    console.log(`${logIndicator} lambdaStarter - Event : ${JSON.stringify(event)}`)
    event.isValid = 0
    callback(null, event);
};
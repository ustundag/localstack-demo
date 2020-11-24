const AWS = require('aws-sdk');
const logIndicator = `-----------`

exports.handler = async (event) => {
    const eventBody = JSON.parse(event.Records[0].body);
    const threshold = parseInt(process.env.threshold, 10);
    const price = parseInt(eventBody.price, 10);
    if(price > threshold){
        console.log(`\n${logIndicator} lambdaNotifier: Price is still above the threshold :(`);
        return;
    }
    return await snsSendNotification(price)
}

async function snsSendNotification(price){
    const region = process.env.region
    AWS.config.update({
      region: region,
      endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566` // remove this before deploying to prod
    });
    var params = {
        TopicArn: process.env.snsTopicArn,
        Subject: "Price Notification",
        Message: `Discount alert! New price is ${price} TL.`
    };
    return await new AWS.SNS().publish(params).promise()
    .then(
        function(data)  { console.log(`\n${logIndicator} lambdaNotifier: SNS Notification has been sent!`) },
        function(error) { console.log(`\n${logIndicator} lambdaNotifier: SNS Error: ${error}`) }
    );
}

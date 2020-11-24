const AWS = require('aws-sdk');
const logIndicator = `-----------`

exports.handler =  async function(event) {
  console.log(`\n${logIndicator} lambdaUrlValidator is triggered by eventBridge.`);
  console.log(`\n${logIndicator} time: ${new Date()}`);
  let message = {
    "url": process.env.url
  }
  if(isValidURL(message.url)){
    return await sqsSendMessage(message)
  }
  return await snsSendNotification(message)
}

function isValidURL(url) {
  var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(url);
}

async function sqsSendMessage(message){
  const AWS_ACCESS_KEY_ID = process.env.accessKeyId
  const AWS_SECRET_ACCESS_KEY = process.env.secretAccessKey
  const region = process.env.region
  AWS.config.update({
    region: region,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });
  const sqs_queue = process.env.sqs_queue;  
  var params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: sqs_queue
  };
  return await new AWS.SQS().sendMessage(params).promise()
  .then(
    function(data)  { console.log(`\n${logIndicator} lambdaUrlValidator: SQS message has been sent!`); },
    function(error) { console.log(`\n${logIndicator} lambdaUrlValidator: SQS Error: ${error}`);
  });
}

async function snsSendNotification(message){
  const region = process.env.region
  AWS.config.update({
    region: region,
    endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566` // remove this before deploying to prod!
  });
  var params = {
      TopicArn: process.env.snsTopicArn,
      Subject: "Price Notification",
      Message: `Please check the URL. It is not valid! \nURL: ${message.url}`
  };

  return await new AWS.SNS().publish(params).promise()
  .then(
      function(data)  { console.log(`\n${logIndicator} lambdaUrlValidator: SNS notification has been sent!`); },
      function(error) { console.log(`\n${logIndicator} lambdaUrlValidator: SNS Error: ${error}`);
  });
}
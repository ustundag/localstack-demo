const AWS = require('aws-sdk');
const axios = require('axios');
const cheerio = require('cheerio');
const logIndicator = `-----------`

exports.handler = async (event) => {
    const eventBody = JSON.parse(event.Records[0].body);
    return await axios.get(eventBody.url)
    .then(response => {
        let price = -1
        if (response.status == 200) {
            price = parseHTML(response.data)
            return price
        }
        else {
            throw new Error('HTTP request failed!')
        }
    })
    .then(price => {
        return sqsSendMessage(price)
    })
    .catch(error => {
        console.log(`\n${logIndicator} lambdaScraper: error: ${error.response}`)
        return -1
    });
}

function parseHTML(html){
    const $ = cheerio.load(html.toString());
    var el = $('span:contains(" TL")').first().text();
    const price = el.toString().match(/([0-9]*)/g).toString().replace(/[,*|]/g, "")
    return price;
}

async function sqsSendMessage(price){
    const AWS_ACCESS_KEY_ID = process.env.accessKeyId
    const AWS_SECRET_ACCESS_KEY = process.env.secretAccessKey
    const region = process.env.region
    AWS.config.update({
      region: region,
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    });
    const sqs_queue = process.env.sqs_queue
    var params = {
      MessageBody: JSON.stringify({"price": price}),
      QueueUrl: sqs_queue
    };
    return await new AWS.SQS().sendMessage(params).promise()
    .then(
      function(data)  { console.log(`\n${logIndicator} lambdaScraper: SQS message has been sent!`) },
      function(error) { console.log(`\n${logIndicator} lambdaScraper: Error: ${error}`)
    })
  }
#!/bin/bash

# Get the ID of the latest created container (must be LocalStack)
containerId=$(docker ps -l -q)
# Inspect the container and get IP address
localIPAddress=$(docker inspect -f "{{ .NetworkSettings.IPAddress }}" $containerId)
echo "Localstack container IP is $localIPAddress"

awslocal lambda create-function --function-name lambdaUrlValidator \
    --code S3Bucket="__local__",S3Key="/Users/anil.ustundag/Github/localstack-demo/lambdas/lambdaUrlValidator" \
    --handler index.handler \
    --runtime nodejs12.x \
    --role whatever;
awslocal lambda create-function --function-name lambdaScraper \
    --code S3Bucket="__local__",S3Key="/Users/anil.ustundag/Github/localstack-demo/lambdas/lambdaScraper" \
    --handler index.handler \
    --runtime nodejs12.x \
    --role whatever;
awslocal lambda create-function --function-name lambdaNotifier \
    --code S3Bucket="__local__",S3Key="/Users/anil.ustundag/Github/localstack-demo/lambdas/lambdaNotifier" \
    --handler index.handler \
    --runtime nodejs12.x \
    --role whatever;

sleep 1
url="https://www.trendyol.com/apple/iphone-se-2020-64-gb-beyaz-cep-telefonu-apple-turkiye-garantili-p-40776212"
threshold="5000"

awslocal lambda update-function-configuration --function-name lambdaUrlValidator \
    --environment "Variables={
        accessKeyId=test, secretAccessKey=test, region=eu-central-1,
        sqs_queue = http://$localIPAddress:4566/queue/sqs_queue_scrape, 
        url = $url, 
        snsTopicArn = arn:aws:sns:eu-central-1:000000000000:sns_topic_price}"
awslocal lambda update-function-configuration --function-name lambdaScraper \
    --environment "Variables={
        accessKeyId=test, secretAccessKey=test, region=eu-central-1,
        sqs_queue = http://$localIPAddress:4566/queue/sqs_queue_notify}"
awslocal lambda update-function-configuration --function-name lambdaNotifier \
    --environment "Variables={
        accessKeyId=test, secretAccessKey=test, region=eu-central-1,
        threshold = $threshold,
        snsTopicArn = arn:aws:sns:eu-central-1:000000000000:sns_topic_price}"

sleep 1
awslocal lambda create-event-source-mapping \
    --function-name lambdaScraper \
    --batch-size 1 \
    --event-source-arn arn:aws:sqs:eu-central-1:000000000000:sqs_queue_scrape;
awslocal lambda create-event-source-mapping \
    --function-name lambdaNotifier \
    --batch-size 1 \
    --event-source-arn arn:aws:sqs:eu-central-1:000000000000:sqs_queue_notify;

awslocal sqs purge-queue --queue-url http://localhost:4566/000000000000/sqs_queue_scrape
awslocal sqs purge-queue --queue-url http://localhost:4566/000000000000/sqs_queue_notify

# awslocal lambda invoke \
#     --function-name lambdaUrlValidator \
#     --invocation-type Event \
#     --payload '{ "name": "Bob" }' \
#     response.json;

awslocal events put-rule --name twice_a_day --schedule-expression "rate(1 minutes)"
# awslocal events put-rule --name "twice_a_day" --schedule-expression "rate(12 hours)"
# awslocal events put-rule --name "twice_a_day" --schedule-expression "cron(0 0 8,20 * * ?)"
awslocal events put-targets --rule twice_a_day \
    --targets "Id"="1","Arn"="arn:aws:lambda:eu-central-1:000000000000:function:lambdaUrlValidator"

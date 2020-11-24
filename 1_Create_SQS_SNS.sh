#!/bin/bash

awslocal sqs create-queue --queue-name sqs_queue_scrape
awslocal sqs create-queue --queue-name sqs_queue_notify
awslocal sns create-topic --name sns_topic_price

mobile_num="+901234567890"
awslocal sns subscribe \
    --topic-arn arn:aws:sns:eu-central-1:000000000000:sns_topic_price \
    --protocol sms \
    --notification-endpoint $mobile_num

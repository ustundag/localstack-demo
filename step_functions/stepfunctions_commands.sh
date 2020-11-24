# #!/bin/bash

awslocal stepfunctions delete-state-machine \
    --state-machine-arn arn:aws:states:eu-central-1:000000000000:stateMachine:HelloWorld
awslocal lambda delete-function --function-name lambdaStarter
awslocal lambda delete-function --function-name lambdaSuccess
awslocal lambda delete-function --function-name lambdaFailed

awslocal lambda create-function --function-name lambdaStarter \
    --code S3Bucket="__local__",S3Key="/Users/anil.ustundag/Github/localstack-demo/step_functions/" \
    --handler lambdaStarter.handler \
    --runtime nodejs12.x \
    --role whatever;
awslocal lambda create-function --function-name lambdaSuccess \
    --code S3Bucket="__local__",S3Key="/Users/anil.ustundag/Github/localstack-demo/step_functions/" \
    --handler lambdaSuccess.handler \
    --runtime nodejs12.x \
    --role whatever;
awslocal lambda create-function --function-name lambdaFailed \
    --code S3Bucket="__local__",S3Key="/Users/anil.ustundag/Github/localstack-demo/step_functions/" \
    --handler lambdaFailed.handler \
    --runtime nodejs12.x \
    --role whatever;
sleep 1;

awslocal stepfunctions create-state-machine \
--name "HelloWorld" --role-arn "arn:aws:iam::012345678901:role/DummyRole"  \
--definition '{
  "Comment": "AWS Step Functions Example in Localstack",
  "StartAt": "StarterState",
  "States": {
    "StarterState": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:eu-central-1:000000000000:function:lambdaStarter",
      "Next": "Is URL Valid"
    },
    "Is URL Valid": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.isValid",
          "NumericEquals": 1,
          "Next": "Success"
        },
        {
          "Variable": "$.isValid",
          "NumericEquals": 0,
          "Next": "Failed"
        }
      ]
    },
    "Success": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:eu-central-1:000000000000:function:lambdaSuccess",
      "End": true
    },
    "Failed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:eu-central-1:000000000000:function:lambdaFailed",
      "End": true
    }
  }
}'

echo "invoking step-functions in 2 seconds..."
sleep 2

awslocal stepfunctions start-execution \
--state-machine-arn arn:aws:states:eu-central-1:000000000000:stateMachine:HelloWorld \
--input '{
    "who": "localstack",
    "task": "test"
}'

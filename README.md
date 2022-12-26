# Local AWS Project - Discount-Spotter

LocalStack demo of a fully-serverless auditor project called discount-spotter which simply scrapes a URL and sends a notification if the price is below the threshold. The project basically requires AWS services such as EventBridge for the auditor, Lambda for data transformation, SQS for message queuing, and SNS for notification.

You can find more details in [the medium post here](https://ustundag.medium.com/local-testing-aws-applications-at-no-cost-c0bdd009d1d0).

![Main screen](https://raw.githubusercontent.com/ustundag/localstack-demo/main/images/discount-spotter.png)

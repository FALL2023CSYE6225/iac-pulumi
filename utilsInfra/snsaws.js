const aws = require('@pulumi/aws');

async function createSNS() {
  // Create a standard SNS Topic
  const snsTopic = new aws.sns.Topic('mySNSTopic', {
    displayName: 'mySNSTopic',
    name: 'mySNSTopic',
  });

  return snsTopic.arn;
}

async function subscribeToSNS(topicArn, awsLambdaARN) {
  // Create the SNS topic subscription for the lambda
  const lambdaSubscription = new aws.sns.TopicSubscription(
    'lambdaSubscription',
    {
      protocol: 'lambda',
      endpoint: awsLambdaARN, // Lambda ARN as endpoint
      topic: topicArn,
    }
  );

  // Add permissions for SNS to trigger the Lambda function
  new aws.lambda.Permission('sns-permission', {
    action: 'lambda:InvokeFunction',
    function: awsLambdaARN,
    principal: 'sns.amazonaws.com',
    sourceArn: topicArn,
  });
}

module.exports = { createSNS, subscribeToSNS };

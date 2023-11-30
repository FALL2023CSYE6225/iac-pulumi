const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const config = new pulumi.Config();
const mailGunApi = config.get('mailGun');

async function createLambda(gcp_access_key, gcpBucketName, dynamoName) {
  // Create an IAM role for the Lambda
  const lambdaRole = new aws.iam.Role('lambdaRole', {
    assumeRolePolicy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
          Effect: 'Allow',
        },
      ],
    }),
  });

  // Attach the AWSLambdaBasicExecutionRole policy
  new aws.iam.RolePolicyAttachment('lambdaRolePolicy', {
    role: lambdaRole.name,
    policyArn:
      'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
  });

  // Attach the AWS managed policy for DynamoDB execution to the role
  new aws.iam.RolePolicyAttachment('dynamodb', {
    role: lambdaRole.name,
    policyArn: 'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
  });

  // Create the lambda function
  const lambdaFunction = new aws.lambda.Function('mylambda', {
    code: new pulumi.asset.AssetArchive({
      '.': new pulumi.asset.FileArchive('./serverless.zip'),
    }),
    role: lambdaRole.arn,
    handler: 'index.handler', // Your exported handler function
    runtime: 'nodejs16.x',
    packageType: 'Zip',

    environment: {
      variables: {
        GCP_CREDENTIALS: gcp_access_key,
        GCP_BUCKET_NAME: gcpBucketName,
        DYNAMODB_TABLE_NAME: dynamoName,
        MAILGUN_API_KEY: mailGunApi,
      },
    },
    timeout: 600, // 10 minutes in seconds
  });

  return lambdaFunction.arn;
}

module.exports = { createLambda };

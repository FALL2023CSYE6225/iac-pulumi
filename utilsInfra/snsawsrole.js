const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');

async function createSNSIamRole() {
  // Create IAM role for SNS
  const snsRole = new aws.iam.Role('snsRole', {
    assumeRolePolicy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Principal: {
            Service: 'sns.amazonaws.com',
          },
          Effect: 'Allow',
        },
      ],
    }),
  });

  // Create SNS Publish policy
  const snsPublishPolicy = new aws.iam.Policy('snsPublishPolicy', {
    policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: ['sns:Publish'],
          Effect: 'Allow',
          Resource: '*',
        },
      ],
    }),
  });

  // Attach SNS Publish policy to IAM role
  const snsPolicyAttachment = new aws.iam.RolePolicyAttachment(
    'snsPublishAttach',
    {
      role: snsRole.arn,
      policyArn: snsPublishPolicy.arn,
    }
  );
}

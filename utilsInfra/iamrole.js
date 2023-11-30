const aws = require('@pulumi/aws');

async function createEc2CloudWatchSNSIamRole() {
  const role = new aws.iam.Role('myEC2Role', {
    assumeRolePolicy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'ec2.amazonaws.com',
          },
        },
      ],
    }),
    tags: {
      'tag-key': 'EC2Roles',
    },
  });

  // Attach the CloudWatchAgentServerPolicy policy to the role
  const cloudWatchIamRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
    'myEC2RolePolicyAttachment',
    {
      policyArn: 'arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy',
      role: role.name,
    }
  );

  //Assign9
  // Attach AmazonSNSFullAccess policy to IAM role
  const snsPolicyAttachment = new aws.iam.RolePolicyAttachment(
    'EC2SNSFullAccessPolicyAttachment',
    {
      policyArn: 'arn:aws:iam::aws:policy/AmazonSNSFullAccess',
      role: role.name,
    }
  );

  return role;
}

module.exports = { createEc2CloudWatchSNSIamRole };

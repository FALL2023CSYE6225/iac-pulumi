const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');

const config = new pulumi.Config();
const aws_profile = config.get('profile');

const awsProvider = new aws.Provider('provider', {
  profile: aws_profile, // Replace with your AWS CLI profile name or leave it empty if using environment credentials or IAM role
});

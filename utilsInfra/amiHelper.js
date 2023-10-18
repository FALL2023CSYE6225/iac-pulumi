// amiHelper.js
const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');

function getMatchingAmi() {
  const pulumiStack = pulumi.runtime.getStack();

  if (pulumiStack === 'dev') {
    // For the "dev" stack, use your logic to get the AMI for your own AWS account.
    const ami = pulumi.output(
      aws.ec2.getAmi({
        owners: ['self'],
        mostRecent: true,
        filters: [
          { name: 'name', values: ['csye6225*'] }, // Match AMIs with names starting with "csye6225"
          { name: 'root-device-type', values: ['ebs'] }, // Match AMIs with EBS root devices
        ],
      })
    );

    return ami;
  } else if (pulumiStack === 'demo') {
    // For other environments, specify the AWS account that shared the AMI.
    //console.log('HHHHH');
    const ami = pulumi.output(
      aws.ec2.getAmi({
        owners: ['self'],
        mostRecent: true,
        filters: [
          { name: 'name', values: ['csye6225*'] }, // Match AMIs with names starting with "csye6225"
          { name: 'root-device-type', values: ['ebs'] }, // Match AMIs with EBS root devices
        ],
      })
    );

    return ami;
  }
}

module.exports = { getMatchingAmi };

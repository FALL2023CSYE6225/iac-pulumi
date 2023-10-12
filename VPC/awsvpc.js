// const pulumi = require('@pulumi/pulumi');
// const aws = require('@pulumi/aws');

// // Create an AWS VPC
// const myVPC = new aws.ec2.Vpc('myVPC', {
//   cidrBlock: '10.200.0.0/16',
//   enableDnsSupport: true,
//   enableDnsHostnames: true,
//   instanceTenancy: 'default',
//   tags: {
//     Name: 'my-VPC',
//   },
// });

// // Export the VPC ID for later use
// //exports.vpcId = myVPC.id;

// exports.myVPC = myVPC;

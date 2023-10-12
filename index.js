'use strict';
const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const awsx = require('@pulumi/awsx');
const config = new pulumi.Config();
// {
//   provider: provider;
// }

const {
  createPublicSubnets,
  createPrivateSubnets,
  createPublicRouteTable,
  createPrivateRouteTable,
} = require('./utilsInfra/helper');

// Retrieve configuration values or use defaults if not defined
const vpcName = config.get('vpc_name') || 'my-VPC';
//console.log('Vpc NAME', vpcName);
const vpcCidrBlock = config.get('vpc-cidrBlock') || '10.200.0.0/16';

//console.log('Vpc Cidar block', vpcCidrBlock);
const iGateWayConfig = config.get('InternetGateway') || 'IGW';
//console.log(iGateWayConfig);

// Create an AWS VPC
async function createInfrastructure() {
  const myVPC = new aws.ec2.Vpc(vpcName, {
    cidrBlock: vpcCidrBlock,
    enableDnsSupport: true,
    enableDnsHostnames: true,
    instanceTenancy: 'default',
    tags: {
      Name: vpcName,
    },
  });

  const vpcIdValue = myVPC.id;

  const iGateway = new aws.ec2.InternetGateway(iGateWayConfig, {
    vpcId: vpcIdValue,
    tags: {
      Name: iGateWayConfig,
    },
  });

  const iGatewayId = iGateway.id;
  const publicSubnetsArray = await createPublicSubnets(vpcIdValue);
  //console.log(publicSubnetsArray);
  const privateSubnetsArray = await createPrivateSubnets(vpcIdValue);
  const publicRouteCreatedId = await createPublicRouteTable(
    vpcIdValue,
    iGatewayId
  );
  const privateRouteCreatedId = await createPrivateRouteTable(vpcIdValue);
  //const awsVpc = require('./VPC/awsvpc');

  publicSubnetsArray.forEach((subnet, index) => {
    const association = new aws.ec2.RouteTableAssociation(
      `publicSubnetAssociation${index + 1}`,
      {
        subnetId: subnet.id,
        routeTableId: publicRouteCreatedId,
      }
    );
  });

  privateSubnetsArray.forEach((subnet, index) => {
    const association = new aws.ec2.RouteTableAssociation(
      `privateSubnetAssociation${index + 1}`,
      {
        subnetId: subnet.id,
        routeTableId: privateRouteCreatedId,
      }
    );
  });
}

createInfrastructure();
//const myVPC = awsVpc.myVPC;

// Create an AWS resource (S3 Bucket)
//const bucket = new aws.s3.Bucket("my-bucket");

// Export the name of the bucket
//exports.bucketName = bucket.id;

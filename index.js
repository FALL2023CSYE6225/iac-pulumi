'use strict';
const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const awsx = require('@pulumi/awsx');
const { instanceConfig } = require('./utilsInfra/var');
const amiHelper = require('./utilsInfra/amiHelper');
const createSecurityGroup = require('./utilsInfra/securityGroup');
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
const amiId = config.get('amiId');

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
  const firstPublicSubnetId = publicSubnetsArray[0].id;
  //console.log('ID of the first public subnet:', firstPublicSubnetId);
  //const myIpCidr = pulumi.output(getPublicIp()).apply((ip) => `${ip}/32`);
  //console.log('MY IP', myIpCidr);
  /*
  const securityGroup = new aws.ec2.SecurityGroup('securityGroup', {
    name: 'application security group',
    description: 'Allow HTTP, HTTPS, SSH, and Custom TCP traffic',
    vpcId: vpcIdValue,
    ingress: [
      {
        description: 'HTTP from Anywhere (IPv4)',
        fromPort: 80,
        toPort: 80,
        protocol: 'tcp',
        cidrBlocks: ['0.0.0.0/0'],
      },
      {
        description: 'HTTP from Anywhere (IPv6)',
        fromPort: 80,
        toPort: 80,
        protocol: 'tcp',
        ipv6CidrBlocks: ['::/0'],
      },
      {
        description: 'HTTPS from Anywhere (IPv4)',
        fromPort: 443,
        toPort: 443,
        protocol: 'tcp',
        cidrBlocks: ['0.0.0.0/0'],
      },
      {
        description: 'HTTPS from Anywhere (IPv6)',
        fromPort: 443,
        toPort: 443,
        protocol: 'tcp',
        ipv6CidrBlocks: ['::/0'],
      },
      {
        description: 'SSH from My IP',
        fromPort: 22,
        toPort: 22,
        protocol: 'tcp',
        cidrBlocks: ['0.0.0.0/0'],
      },
      {
        description: 'Custom TCP Port 8080 from Anywhere (IPv4)',
        fromPort: 8080,
        toPort: 8080,
        protocol: 'tcp',
        cidrBlocks: ['0.0.0.0/0'],
      },
      {
        description: 'Custom TCP Port 8080 from Anywhere (IPv6)',
        fromPort: 8080,
        toPort: 8080,
        protocol: 'tcp',
        ipv6CidrBlocks: ['::/0'],
      },
    ],
    tags: {
      Name: 'application security group',
    },
    egress: [
      {
        fromPort: 0,
        toPort: 0,
        protocol: '-1', // This allows all protocols
        cidrBlocks: ['0.0.0.0/0'], // This allows all IPv4 traffic
      },
    ],
  });
*/
  // const Ami = amiHelper.getMatchingAmi(); // Call the function
  /*
  matchingAmi.apply((ami) => {

    // Access the AMI data here
    console.log(`Found matching AMI ID: ${ami.id}`);
  });*/
  const securityGroup = await createSecurityGroup(vpcIdValue);
  const instance = new aws.ec2.Instance('instance', {
    ami: amiId,
    keyName: instanceConfig.keyName,
    instanceType: instanceConfig.instanceType,
    subnetId: firstPublicSubnetId,
    vpcSecurityGroupIds: [securityGroup.id],
    rootBlockDevice: {
      volumeSize: instanceConfig.rootBlockDevice.volumeSize,
      volumeType: instanceConfig.rootBlockDevice.volumeType,
      deleteOnTermination: instanceConfig.rootBlockDevice.deleteOnTermination,
    },
    disableApiTermination: instanceConfig.disableApiTermination,
    tags: instanceConfig.tags,
  });
}

createInfrastructure();

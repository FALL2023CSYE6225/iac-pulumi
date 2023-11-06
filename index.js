'use strict';
const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const awsx = require('@pulumi/awsx');
const { instanceConfig } = require('./utilsInfra/var');
const amiHelper = require('./utilsInfra/amiHelper');
const {
  createSecurityGroup,
  dataBaseSecurityGroup,
} = require('./utilsInfra/securityGroup');

const { createRDSPostgres } = require('./utilsInfra/rdspostgres');
const { createUpdateDNSA } = require('./utilsInfra/dnsrecordA');
const { createEc2Instance } = require('./utilsInfra/ec2');
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
const baseDomain = config.get('baseDomain');

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

  // const Ami = amiHelper.getMatchingAmi(); // Call the function
  /*
  matchingAmi.apply((ami) => {

    // Access the AMI data here
    console.log(`Found matching AMI ID: ${ami.id}`);
  });*/
  const securityGroup = await createSecurityGroup(vpcIdValue);
  const appSecurityGroupId = securityGroup.id;
  const dbsecurityGroup = await dataBaseSecurityGroup(
    vpcIdValue,
    appSecurityGroupId
  );

  const dbSubnetGroupName = new aws.rds.SubnetGroup('my-dbsubnet-group', {
    subnetIds: privateSubnetsArray.map((subnet) => subnet.id),
    tags: {
      Name: 'db-subnet-group',
    },
  });

  const dbsecurityGroupId = dbsecurityGroup.id;
  const rdsPostgres = await createRDSPostgres(
    dbsecurityGroupId,
    dbSubnetGroupName
  );
  //console.log(rdsPostgres);
  //const dbParameterGroup = await createRDSParameterGroup();
  //Add the Parameters to Group
  /*
  const instance = new aws.ec2.Instance('instance', {
    ami: amiId,
    keyName: instanceConfig.keyName,
    instanceType: instanceConfig.instanceType,
    subnetId: firstPublicSubnetId,
    vpcSecurityGroupIds: [securityGroup.id],
    userData: pulumi
      .all([
        rdsPostgres.endpoint,
        rdsPostgres.username,
        rdsPostgres.password,
        rdsPostgres.dbName,
      ])
      .apply(([endpoint, user, pass, dbName]) => {
        const host = endpoint.split(':')[0];
        return `#!/bin/bash
          echo DB_DIALECT=${config.get('DB_DIALECT')} >> /etc/environment
          echo DB_NAME=${dbName} >> /etc/environment
          echo DB_HOST=${host} >> /etc/environment
          echo DB_USER=${user} >> /etc/environment
          echo DB_PASSWORD=${pass} >> /etc/environment
          echo PORT=${config.get('PORT')} >> /etc/environment
          sudo systemctl daemon-reload
      `;
      }),
    rootBlockDevice: {
      volumeSize: instanceConfig.rootBlockDevice.volumeSize,
      volumeType: instanceConfig.rootBlockDevice.volumeType,
      deleteOnTermination: instanceConfig.rootBlockDevice.deleteOnTermination,
    },
    disableApiTermination: instanceConfig.disableApiTermination,
    tags: instanceConfig.tags,
    //opts: pulumi.ResourceOptions({ dependsOn: [rdsPostgres] }),
  });
*/
  // await instance.id;
  const instance = await createEc2Instance(
    amiId,
    firstPublicSubnetId,
    appSecurityGroupId,
    rdsPostgres
  );

  const dnsrecordACreateUpdate = await createUpdateDNSA(
    baseDomain,
    instance.publicIp
  );
}

createInfrastructure();

const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const { instanceConfig } = require('../utilsInfra/var');
const { createEc2CloudWatchIamRole } = require('../utilsInfra/iamrole');
const config = new pulumi.Config();

async function createEc2Instance(
  amiId,
  firstPublicSubnetId,
  appSecurityGroupId,
  rdsPostgres
) {
  // Create the IAM role for CloudWatch agent
  const cloudWatchIamRole = await createEc2CloudWatchIamRole();
  const instanceProfile = new aws.iam.InstanceProfile('myInstanceProfile', {
    role: cloudWatchIamRole.name,
  });

  const instance = new aws.ec2.Instance('instance', {
    ami: amiId,
    keyName: instanceConfig.keyName,
    instanceType: instanceConfig.instanceType,
    subnetId: firstPublicSubnetId,
    vpcSecurityGroupIds: [appSecurityGroupId],
    iamInstanceProfile: instanceProfile.name,
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
              sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/cloudwatch-config.json -s
              sudo systemctl enable amazon-cloudwatch-agent
              sudo systemctl start amazon-cloudwatch-agent
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

  return instance;
}

module.exports = { createEc2Instance };

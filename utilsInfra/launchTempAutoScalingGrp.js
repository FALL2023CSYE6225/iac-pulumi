const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const vars = require('./var');
const config = new pulumi.Config();
const { autoscaling } = require('@pulumi/aws');
const { cloudwatch } = require('@pulumi/aws');
//amiId  --pass funct
async function createEc2FromLaunchTemp(
  amiId,
  instanceProfile,
  appSecurityGroupId,
  rdsPostgres,
  snsArn,
  snsRegion
) {
  const userDataScript = pulumi
    .all([
      rdsPostgres.endpoint,
      rdsPostgres.username,
      rdsPostgres.password,
      rdsPostgres.dbName,
      snsArn,
      snsRegion,
    ])
    .apply(([endpoint, user, pass, dbName, snsArn, snsRegion]) => {
      const host = endpoint.split(':')[0];
      return `#!/bin/bash
        echo DB_DIALECT=${config.get('DB_DIALECT')} >> /etc/environment
        echo DB_NAME=${dbName} >> /etc/environment
        echo DB_HOST=${host} >> /etc/environment
        echo DB_USER=${user} >> /etc/environment
        echo DB_PASSWORD=${pass} >> /etc/environment
        echo PORT=${config.get('PORT')} >> /etc/environment
        echo REGION=${snsRegion} >> /etc/environment
        echo TOPICARN=${snsArn} >> /etc/environment
        sudo systemctl daemon-reload
        sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/cloudwatch-config.json -s
        sudo systemctl enable amazon-cloudwatch-agent
        sudo systemctl start amazon-cloudwatch-agent
        sudo systemctl daemon-reload
      `;
    });

  const launchTemplate = new aws.ec2.LaunchTemplate(
    vars.launchTemplateConfig.launchConfigName,
    {
      name: vars.launchTemplateConfig.launchConfigName,
      version: '1',
      imageId: amiId, //pass
      instanceType: vars.launchTemplateConfig.instanceType,
      iamInstanceProfile: {
        name: instanceProfile.name, //pass
      },
      disableApiTermination: vars.launchTemplateConfig.disableApiTermination,
      networkInterfaces: [
        {
          associatePublicIpAddress:
            vars.launchTemplateConfig.networkInterfaces
              .associatePublicIpAddress, //check
          securityGroups: [appSecurityGroupId], //pass
        },
      ],
      blockDeviceMappings: [
        {
          deviceName: vars.launchTemplateConfig.rootBlockDevice.deviceName,
          ebs: {
            deleteOnTermination:
              vars.launchTemplateConfig.rootBlockDevice.deleteOnTermination,
            volumeSize: vars.launchTemplateConfig.rootBlockDevice.volumeSize,
            volumeType: vars.launchTemplateConfig.rootBlockDevice.volumeType,
          },
        },
      ],
      tagSpecifications: [
        {
          resourceType: 'instance',
          tags: {
            Name: vars.autoScalingGrpConfig.name,
          },
        },
      ],
      keyName: vars.launchTemplateConfig.keyName,
      userData: pulumi
        .output(userDataScript)
        .apply((script) => Buffer.from(script).toString('base64')),
      tags: {
        Name: vars.launchTemplateConfig.tags.Name,
      },
    }
  );
  return launchTemplate;
}

async function createAutoScalingGrp(
  publicSubnetsArray,
  launchTempId,
  targetGroupARN
) {
  const csye6225Asg = new aws.autoscaling.Group('csye6225Asg', {
    desiredCapacity: vars.autoScalingGrpConfig.asg_desired_capacity,
    maxSize: vars.autoScalingGrpConfig.asg_max_size,
    minSize: vars.autoScalingGrpConfig.asg_min_size,
    defaultCooldown: vars.autoScalingGrpConfig.asg_cooldown_period,
    vpcZoneIdentifiers: publicSubnetsArray.map((subnet) => subnet.id), //pass
    launchTemplate: {
      id: launchTempId, //pass
      version: '$Latest',
    },
    targetGroupArns: [targetGroupARN], //pass
    tags: [
      {
        key: 'asg_key1',
        value: vars.autoScalingGrpConfig.asg_application_name,
        propagateAtLaunch: vars.autoScalingGrpConfig.asg_propagate_at_launch,
      },
      {
        key: 'asg_key2',
        value: vars.autoScalingGrpConfig.asg_environment,
        propagateAtLaunch: vars.autoScalingGrpConfig.asg_propagate_at_launch,
      },
    ],
  });

  // ASG Scaling Policy
  // Scale Up Policy
  const scaleUpPolicy = new autoscaling.Policy('scaleUpPolicy', {
    autoscalingGroupName: csye6225Asg.name,
    policyType: vars.autoScalingGrpConfig.asgPolicyType,
    adjustmentType: vars.autoScalingGrpConfig.asgAdjustmentType,
    scalingAdjustment: vars.autoScalingGrpConfig.asgScalingIncrement,
    cooldown: vars.autoScalingGrpConfig.asgCooldownPeriod,
  });

  // Scale Down Policy
  const scaleDownPolicy = new autoscaling.Policy('scaleDownPolicy', {
    autoscalingGroupName: csye6225Asg.name,
    policyType: vars.autoScalingGrpConfig.asgPolicyType,
    adjustmentType: vars.autoScalingGrpConfig.asgAdjustmentType,
    scalingAdjustment: vars.autoScalingGrpConfig.asgScalingDecrement,
    cooldown: vars.autoScalingGrpConfig.asgCooldownPeriod,
  });

  // CloudWatch Metric Alarm - High CPU (Scale Up)
  const highCpuAlarm = new cloudwatch.MetricAlarm('highCpuAlarm', {
    comparisonOperator: vars.autoScalingGrpConfig.asgComparisonOperatorUp,
    evaluationPeriods: vars.autoScalingGrpConfig.asgEvaluationPeriods,
    metricName: vars.autoScalingGrpConfig.asgCpuMetricName,
    namespace: vars.autoScalingGrpConfig.asgNamespace,
    period: vars.autoScalingGrpConfig.asgScalingPeriod,
    statistic: vars.autoScalingGrpConfig.asgStatistic,
    threshold: vars.autoScalingGrpConfig.asgCpuThresholdUp,
    dimensions: { AutoScalingGroupName: csye6225Asg.name },
    alarmActions: [scaleUpPolicy.arn],
    alarmDescription: vars.autoScalingGrpConfig.asgHighAlarmDescription,
  });

  // CloudWatch Metric Alarm - Low CPU (Scale Down)
  const lowCpuAlarm = new cloudwatch.MetricAlarm('lowCpuAlarm', {
    comparisonOperator: vars.autoScalingGrpConfig.asgComparisonOperatorDown,
    evaluationPeriods: vars.autoScalingGrpConfig.asgEvaluationPeriods,
    metricName: vars.autoScalingGrpConfig.asgCpuMetricName,
    namespace: vars.autoScalingGrpConfig.asgNamespace,
    period: vars.autoScalingGrpConfig.asgScalingPeriod,
    statistic: vars.autoScalingGrpConfig.asgStatistic,
    threshold: vars.autoScalingGrpConfig.asgCpuThresholdDown,
    dimensions: { AutoScalingGroupName: csye6225Asg.name },
    alarmActions: [scaleDownPolicy.arn],
    alarmDescription: vars.autoScalingGrpConfig.asgLowAlarmDescription,
  });
}

module.exports = { createEc2FromLaunchTemp, createAutoScalingGrp };

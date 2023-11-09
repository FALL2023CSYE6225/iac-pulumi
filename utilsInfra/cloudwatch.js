const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');

async function createCloudWatch() {
  //Create log groups and log streams
  const stackName = pulumi.getStack();

  const logGroupName = 'csye6225';
  const logStreamName = 'webapp';

  const auditLogGroupName = 'audit-group';
  const auditLogStreamName = 'audit-stream';

  const logGroup = new aws.cloudwatch.LogGroup(logGroupName, {
    name: logGroupName,
    tags: {
      Application: logGroupName,
      Environment: stackName,
    },
  });

  const logStream = new aws.cloudwatch.LogStream(logStreamName, {
    name: logStreamName,
    logGroupName: logGroup.name,
  });

  const auditLogGroup = new aws.cloudwatch.LogGroup(auditLogGroupName, {
    name: auditLogGroupName,
    tags: {
      Application: auditLogGroupName,
      Environment: stackName,
    },
  });

  const auditLogStream = new aws.cloudwatch.LogStream(auditLogStreamName, {
    name: auditLogStreamName,
    logGroupName: auditLogGroup.name,
  });
}

module.exports = { createCloudWatch };

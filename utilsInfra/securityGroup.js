const aws = require('@pulumi/aws');
//const { ingressRules, egressRules } = require('./rules');
const { init } = require('./rules');
async function createSecurityGroup(vpcId) {
  const { ingressRules, egressRules } = await init();
  const securityGroup = new aws.ec2.SecurityGroup('securityGroup', {
    name: 'application security group',
    description: 'Allow HTTP, HTTPS, SSH, and Custom TCP traffic',
    vpcId: vpcId,
    ingress: ingressRules.map((rule) => {
      const ingressRule = {
        description: rule.description,
        fromPort: rule.fromPort,
        toPort: rule.toPort,
        protocol: rule.protocol,
      };

      if (rule.cidrBlocks) {
        ingressRule.cidrBlocks = rule.cidrBlocks;
      }

      if (rule.ipv6CidrBlocks) {
        ingressRule.ipv6CidrBlocks = rule.ipv6CidrBlocks;
      }

      return ingressRule;
    }),
    tags: {
      Name: 'application security group',
    },
    egress: egressRules.map((rule) => {
      const egressRule = {
        description: rule.description,
        fromPort: rule.fromPort,
        toPort: rule.toPort,
        protocol: rule.protocol,
      };

      if (rule.cidrBlocks) {
        egressRule.cidrBlocks = rule.cidrBlocks;
      }

      if (rule.ipv6CidrBlocks) {
        egressRule.ipv6CidrBlocks = rule.ipv6CidrBlocks;
      }

      return egressRule;
    }),
  });

  return securityGroup;
}

async function dataBaseSecurityGroup(vpcId, appSecurityGroupId) {
  const dbSecurityGroup = new aws.ec2.SecurityGroup('dbsecurityGroup', {
    name: 'database security group',
    description: 'Allow traffic from non default ec2 created',
    vpcId: vpcId,
    ingress: [
      {
        fromPort: 5432,
        toPort: 5432,
        protocol: 'tcp',
        securityGroups: [appSecurityGroupId],
      },
    ],
    tags: {
      Name: 'database security group',
    },
  });
  return dbSecurityGroup;
}

module.exports = { createSecurityGroup, dataBaseSecurityGroup };

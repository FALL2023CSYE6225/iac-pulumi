const aws = require('@pulumi/aws');
const pulumi = require('@pulumi/pulumi');
//const { ingressRules, egressRules } = require('./rules');
const { init, initAppLB } = require('./rules');
async function createSecurityGroup(vpcId, appLBsecurityGroupId) {
  const { ingressRules, egressRules } = await init(appLBsecurityGroupId);
  const securityGroup = new aws.ec2.SecurityGroup('appsecurityGroup', {
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
      if (rule.securityGroups) {
        ingressRule.securityGroups = rule.securityGroups;
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

async function appLoadBalancerSecurityGroup(vpcId) {
  const { ingressRulesLB, egressRulesLB } = await initAppLB();
  const securityGroupALB = new aws.ec2.SecurityGroup('applbsecurityGroup', {
    name: 'load balancer security group',
    description: 'Allow HTTP, HTTPS traffic',
    vpcId: vpcId,
    ingress: ingressRulesLB.map((rule) => {
      const ingressRuleLB = {
        description: rule.description,
        fromPort: rule.fromPort,
        toPort: rule.toPort,
        protocol: rule.protocol,
      };

      if (rule.cidrBlocks) {
        ingressRuleLB.cidrBlocks = rule.cidrBlocks;
      }

      if (rule.ipv6CidrBlocks) {
        ingressRuleLB.ipv6CidrBlocks = rule.ipv6CidrBlocks;
      }

      return ingressRuleLB;
    }),
    tags: {
      Name: 'load balancer security group',
    },
    egress: egressRulesLB.map((rule) => {
      const egressRuleLB = {
        description: rule.description,
        fromPort: rule.fromPort,
        toPort: rule.toPort,
        protocol: rule.protocol,
      };

      if (rule.cidrBlocks) {
        egressRuleLB.cidrBlocks = rule.cidrBlocks;
      }

      if (rule.ipv6CidrBlocks) {
        egressRuleLB.ipv6CidrBlocks = rule.ipv6CidrBlocks;
      }

      return egressRuleLB;
    }),
  });
  //await pulumi.all([securityGroupALB]);
  return securityGroupALB;
}

module.exports = {
  createSecurityGroup,
  dataBaseSecurityGroup,
  appLoadBalancerSecurityGroup,
};

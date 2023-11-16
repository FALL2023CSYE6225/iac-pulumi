const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const vars = require('./var');

async function createLoadBalancerTargetGrpAndListener(vpcIdValue, alb) {
  try {
    //Ntework Mapping
    const targetGroup = new aws.lb.TargetGroup(vars.targetGroupConfig.tg_name, {
      port: vars.targetGroupConfig.tg_port,
      protocol: vars.targetGroupConfig.tg_protocol,
      vpcId: vpcIdValue,
      targetType: vars.targetGroupConfig.tg_target_type,
      ipAddressType: vars.targetGroupConfig.tg_ip_address_type,
      healthCheck: {
        enabled: vars.targetGroupConfig.tg_enable,
        healthyThreshold: vars.targetGroupConfig.tg_healthy_threshold,
        interval: vars.targetGroupConfig.tg_interval,
        path: vars.targetGroupConfig.tg_path,
        port: vars.targetGroupConfig.tg_port,
        timeout: vars.targetGroupConfig.tg_timeout,
      },
      tags: {
        Name: vars.targetGroupConfig.tg_name,
      },
    });

    // Load Balancer
    //BASIC CONFIGURATION name,schema,ip address type
    /* const alb = new aws.lb.LoadBalancer(vars.loadBalancerConfig.lbName, {
      internal: vars.loadBalancerConfig.lbInternal,
      ipAddressType: vars.loadBalancerConfig.lbIpAddressType,
      loadBalancerType: vars.loadBalancerConfig.lbLoadBalancerType,
      securityGroups: [appLBsecurityGroupId],
      subnets: publicSubnetsArray,
      tags: {
        Name: vars.loadBalancerConfig.lbName,
      },
    });*/

    // Listeners and routing on Console
    const listener = new aws.lb.Listener(vars.listenerConfig.lbListenerName, {
      loadBalancerArn: alb.arn,
      port: vars.listenerConfig.lbListenerPort,
      protocol: vars.listenerConfig.lbListenerProtocol,
      defaultActions: [
        {
          type: vars.listenerConfig.lbListenerDefaultActionsType,
          targetGroupArn: targetGroup.arn,
        },
      ],
      tags: {
        Name: vars.listenerConfig.lbListenerName,
      },
    });
    return targetGroup;
  } catch (error) {
    console.error(
      'Error creating resources:',
      error.stack || error.message || error
    );
    throw error;
  }
}

async function createLoadBalancer(appLBsecurityGroupId, publicSubnetsArray) {
  const alb = new aws.lb.LoadBalancer(vars.loadBalancerConfig.lbName, {
    internal: vars.loadBalancerConfig.lbInternal,
    ipAddressType: vars.loadBalancerConfig.lbIpAddressType,
    loadBalancerType: vars.loadBalancerConfig.lbLoadBalancerType,
    securityGroups: [appLBsecurityGroupId],
    subnets: publicSubnetsArray,
    tags: {
      Name: vars.loadBalancerConfig.lbName,
    },
  });
  return alb;
}

module.exports = { createLoadBalancerTargetGrpAndListener, createLoadBalancer };

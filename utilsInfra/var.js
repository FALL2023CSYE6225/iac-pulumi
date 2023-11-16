const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');

// Load Balancer SG Defaults
const loadBalancerSecurityGroupName = 'loadbalancer-security-group';

// Load Balancer Defaults
const lbName = 'MyALB';
const lbLoadBalancerType = 'application';
const lbInternal = false; // Internet facing
const lbIpAddressType = 'ipv4';
//const albEvaluateTargetHealth = true;
const lbEnableDeletionProtection = true;

// Load Balancer Listener Defaults
const lbListenerName = 'MyListener';
const lbListenerPort = 80;
const lbListenerProtocol = 'HTTP';
//const lbType = 'application';
const lbListenerDefaultActionsType = 'forward';
const stack = pulumi.runtime.getStack();

module.exports = {
  route53Config: {
    albEvaluateTargetHealth: true,
  },
  launchTemplateConfig: {
    launchConfigName: 'launchEc2',
    instanceType: 't2.micro',
    keyName: 'KeyPair',
    networkInterfaces: {
      associatePublicIpAddress: true,
    },
    rootBlockDevice: {
      deviceName: '/dev/xvda',
      volumeSize: 25,
      volumeType: 'gp2',
      deleteOnTermination: true,
    },
    disableApiTermination: false,
    tags: {
      Name: 'EC2-LaunchTemp',
    },
  },

  autoScalingGrpConfig: {
    name: 'my-asg-instance',
    asg_desired_capacity: 1,
    asg_min_size: 1,
    asg_max_size: 3,
    asg_cooldown_period: 60,
    asg_application_name: 'csye6225_webapp',
    asg_propagate_at_launch: true,
    asg_environment: stack,
    asg_propagate_at_launch: true,
    asgPolicyType: 'SimpleScaling',
    asgAdjustmentType: 'ChangeInCapacity',
    asgScalingIncrement: 1,
    asgScalingDecrement: -1,
    asgCooldownPeriod: 60,
    asgComparisonOperatorUp: 'GreaterThanThreshold',
    asgComparisonOperatorDown: 'LessThanThreshold',
    asgEvaluationPeriods: 1,
    asgCpuMetricName: 'CPUUtilization',
    asgNamespace: 'AWS/EC2',
    asgScalingPeriod: 60,
    asgStatistic: 'Average',
    asgCpuThresholdUp: 5,
    asgCpuThresholdDown: 3,
    asgHighAlarmDescription: 'Scale up if CPU > 5% for 1 minute',
    asgLowAlarmDescription: 'Scale down if CPU < 3% for 1 minute',
  },
  loadBalancerConfig: {
    loadBalancerSecurityGroupName,
    lbName,
    lbLoadBalancerType,
    lbInternal,
    lbIpAddressType,
    //albEvaluateTargetHealth,
    lbEnableDeletionProtection,
  },

  listenerConfig: {
    lbListenerName,
    lbListenerPort,
    lbListenerProtocol,
    lbListenerDefaultActionsType,
  },
  instanceConfig: {
    instanceType: 't2.micro',
    keyName: 'KeyPair',
    rootBlockDevice: {
      volumeSize: 25,
      volumeType: 'gp2',
      deleteOnTermination: true,
    },
    disableApiTermination: false,
    tags: {
      Name: 'EC2-AMI',
    },
  },

  targetGroupConfig: {
    tg_name: 'MyTargetGroup',
    tg_port: 8080,
    tg_protocol: 'HTTP',
    tg_target_type: 'instance',
    tg_ip_address_type: 'ipv4',
    tg_enable: true,
    tg_path: '/healthz',
    tg_healthy_threshold: 5,
    tg_timeout: 30,
    tg_interval: 60,
  },
};

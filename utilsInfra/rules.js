const { getPublicIp } = require('./helper');
const pulumi = require('@pulumi/pulumi');

async function init() {
  const myIpCidr = pulumi.output(getPublicIp()).apply((ip) => `${ip}/32`);

  return {
    ingressRules: [
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
        cidrBlocks: [myIpCidr],
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
      // Add other rules here
    ],

    egressRules: [
      {
        fromPort: 0,
        toPort: 0,
        protocol: '-1', // This allows all protocols
        cidrBlocks: ['0.0.0.0/0'], // This allows all IPv4 traffic
      },
      {
        fromPort: 0,
        toPort: 0,
        protocol: '-1', // This allows all protocols
        ipv6CidrBlocks: ['::/0'], // This allows all IPv6 traffic
      },
    ],
  };
}

module.exports = { init };

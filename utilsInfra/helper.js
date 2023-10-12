const aws = require('@pulumi/aws');
const pulumi = require('@pulumi/pulumi');
const config = new pulumi.Config();
const publicsubnetCIDRs = config.get('publicsubnetCIDRs');
const privatesubnetCIDRs = config.get('privatesubnetCIDRs');

//console.log('PCDR', publicsubnetCIDRs);
//console.log('Index0', publicsubnetCIDRs[0]);
//////// PUBLIC SUBNET IPv4 CIDR PARSE
const regex = /"([^"]+)"/g;
const matches = [];

let match;
while ((match = regex.exec(publicsubnetCIDRs))) {
  matches.push(match[1]);
}
/////////

//////// PRIVATE SUBNET IPv4 CIDR PARSE
const regexP = /"([^"]+)"/g;
const matchesP = [];

let matchP;
while ((matchP = regex.exec(privatesubnetCIDRs))) {
  matchesP.push(matchP[1]);
}
/////////

async function getAvailabilityZones() {
  const availableZones = await aws.getAvailabilityZones({});
  return availableZones.names;
}

async function getAvailabilityZonesLen() {
  const availableZones = await aws.getAvailabilityZones({});
  return availableZones.names.length;
}

async function createPublicSubnets(vpcIdValue) {
  const azLen = await getAvailabilityZonesLen();
  const publicSubnets = [];
  const availabilityZones = await getAvailabilityZones();
  // Define default values for the pub subnet CIDRs
  const defaultPubSubnetCIDRs = [
    '10.200.1.0/24',
    '10.200.2.0/24',
    '10.200.3.0/24',
  ];
  //console.log('A.Z', availabilityZones);
  if (azLen >= 3) {
    for (let i = 0; i < 3; i++) {
      const pubSubnetCIDR = matches[i] || defaultPubSubnetCIDRs[i];
      // const subnetCIDR = await publicsubnetCIDRs[i];
      //console.log('value', publicsubnetCIDRs[i]);
      //console.log('Public', matches[i]);
      const subnet = new aws.ec2.Subnet(`public-subnet${i + 1}`, {
        vpcId: vpcIdValue,
        cidrBlock: pubSubnetCIDR,
        //cidrBlock: matches[i],
        availabilityZone: availabilityZones[i],
        mapPublicIpOnLaunch: true,
        tags: {
          Name: `public-subnet${i + 1}`,
        },
      });

      publicSubnets.push(subnet);
    }
  } else {
    for (let i = 0; i < azLen; i++) {
      const pubSubnetCIDR = matches[i] || defaultPubSubnetCIDRs[i];
      // const subnetCIDR = await publicsubnetCIDRs[i];
      //console.log('value', publicsubnetCIDRs[i]);
      //console.log('Public', matches[i]);
      const subnet = new aws.ec2.Subnet(`public-subnet${i + 1}`, {
        vpcId: vpcIdValue,
        cidrBlock: pubSubnetCIDR,
        //cidrBlock: matches[i],
        availabilityZone: availabilityZones[i],
        mapPublicIpOnLaunch: true,
        tags: {
          Name: `public-subnet${i + 1}`,
        },
      });

      publicSubnets.push(subnet);
    }
  }

  return publicSubnets;
}

async function createPrivateSubnets(vpcIdValue) {
  const azLen = await getAvailabilityZonesLen();
  const privateSubnets = [];
  const availabilityZones = await getAvailabilityZones();
  const defaultPrivSubnetCIDRs = [
    '10.200.4.0/24',
    '10.200.5.0/24',
    '10.200.6.0/24',
  ];
  if (azLen >= 3) {
    for (let i = 4; i <= 6; i++) {
      //console.log('Private', matchesP[i - 4]);
      const privSubnetCIDR = matchesP[i - 4] || defaultPrivSubnetCIDRs[i - 4];
      const subnet = new aws.ec2.Subnet(`private-subnet${i - 3}`, {
        vpcId: vpcIdValue,
        cidrBlock: privSubnetCIDR,
        //cidrBlock: matchesP[i - 4],
        availabilityZone: availabilityZones[i - 4],
        tags: {
          Name: `private-subnet${i - 3}`,
        },
      });

      privateSubnets.push(subnet);
    }
  } else {
    for (let i = 4; i < 4 + azLen; i++) {
      //console.log('Private', matchesP[i - 4]);
      const privSubnetCIDR = matchesP[i - 4] || defaultPrivSubnetCIDRs[i - 4];
      const subnet = new aws.ec2.Subnet(`private-subnet${i - 3}`, {
        vpcId: vpcIdValue,
        cidrBlock: privSubnetCIDR,
        //cidrBlock: matchesP[i - 4],
        availabilityZone: availabilityZones[i - 4],
        tags: {
          Name: `private-subnet${i - 3}`,
        },
      });

      privateSubnets.push(subnet);
    }
  }

  return privateSubnets;
}

async function createPublicRouteTable(vpcIdValue, iGatewayId) {
  const publicRoute = new aws.ec2.RouteTable('public-RT', {
    vpcId: vpcIdValue,
    routes: [
      {
        cidrBlock: '0.0.0.0/0',
        gatewayId: iGatewayId,
      },
    ],
    tags: {
      Name: 'public-RT',
    },
  });

  return publicRoute.id;
}

async function createPrivateRouteTable(vpcIdValue) {
  const privateRoute = new aws.ec2.RouteTable('private-RT', {
    vpcId: vpcIdValue,
    tags: {
      Name: 'private-RT',
    },
  });

  return privateRoute.id;
}

// Export the public subnets
module.exports = {
  createPublicSubnets,
  createPrivateSubnets,
  createPublicRouteTable,
  createPrivateRouteTable,
};

const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const vars = require('./var');

async function createUpdateDNSA(baseDomain, alb) {
  async function getHostedZone(baseDomain) {
    const hostedZone = await aws.route53.getZone({
      name: baseDomain,
    });

    return hostedZone;
  }
  const albDnsName = alb.dnsName;
  const albTargetZoneId = alb.zoneId;

  const hostedZoneResolved = await getHostedZone(baseDomain);

  const name = baseDomain;

  const wwwName = `www.${baseDomain}`;

  new aws.route53.Record(name, {
    name: name, //no chnage
    // records: [instanceIp],
    //ttl: 300,
    type: 'A', //no change
    zoneId: hostedZoneResolved.id, // no change
    //replaceOnChanges: [instanceIp],
    aliases: [
      {
        name: albDnsName,
        zoneId: albTargetZoneId,
        evaluateTargetHealth: vars.route53Config.albEvaluateTargetHealth,
      },
    ],
  });

  new aws.route53.Record(wwwName, {
    name: wwwName, //no change
    //records: [instanceIp],
    //ttl: 300,
    type: 'A', //no change
    zoneId: hostedZoneResolved.id, // no change
    //replaceOnChanges: [instanceIp],
    aliases: [
      {
        name: albDnsName,
        zoneId: albTargetZoneId,
        evaluateTargetHealth: vars.route53Config.albEvaluateTargetHealth,
      },
    ],
  });
}

module.exports = { createUpdateDNSA };

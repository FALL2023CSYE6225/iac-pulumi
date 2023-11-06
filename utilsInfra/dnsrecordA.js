const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');

async function createUpdateDNSA(baseDomain, instanceIp) {
  async function getHostedZone(baseDomain) {
    const hostedZone = await aws.route53.getZone({
      name: baseDomain,
    });

    return hostedZone;
  }

  const hostedZoneResolved = await getHostedZone(baseDomain);

  const name = baseDomain;

  const wwwName = `www.${baseDomain}`;

  new aws.route53.Record(name, {
    name: name,
    records: [instanceIp],
    ttl: 300,
    type: 'A',
    zoneId: hostedZoneResolved.id,
    replaceOnChanges: [instanceIp],
  });

  new aws.route53.Record(wwwName, {
    name: wwwName,
    records: [instanceIp],
    ttl: 300,
    type: 'A',
    zoneId: hostedZoneResolved.id,
    replaceOnChanges: [instanceIp],
  });
}

module.exports = { createUpdateDNSA };

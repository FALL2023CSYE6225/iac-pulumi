const aws = require('@pulumi/aws');

async function createRDSPostgres() {
  const rdsPostgres = new aws.rds.Instance('default', {
    allocatedStorage: 10,
    dbName: 'mydb',
    engine: 'mysql',
    engineVersion: '5.7',
    instanceClass: 'db.t3.micro',
    parameterGroupName: 'default.mysql5.7',
    password: 'foobarbaz',
    skipFinalSnapshot: true,
    username: 'foo',
  });
  return rdsPostgres;
}

module.exports = { createRDSPostgres };

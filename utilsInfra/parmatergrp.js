const aws = require('@pulumi/aws');

async function createRDSParameterGroup() {
  const dbParameterGroup = new aws.rds.ParameterGroup('dbparametergroup', {
    family: 'postgres15',
    description: 'PostgreSQL Parameter Group',
  });
  return dbParameterGroup;
}

module.exports = { createRDSParameterGroup };

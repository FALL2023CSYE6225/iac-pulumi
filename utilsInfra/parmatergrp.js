const aws = require('@pulumi/aws');

async function createRDSParameterGroup() {
  const dbParameterGroup = new aws.rds.ParameterGroup('dbparametergroup', {
    family: 'postgres14',
    description: 'PostgreSQL Parameter Group',
    parameters: [
      {
        name: 'max_connections',
        value: '100',
        applyMethod: 'pending-reboot',
      },
    ],
  });
  return dbParameterGroup;
}

module.exports = { createRDSParameterGroup };

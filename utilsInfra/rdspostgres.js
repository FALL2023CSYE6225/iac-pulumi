const { createRDSParameterGroup } = require('../utilsInfra/parmatergrp');
const aws = require('@pulumi/aws');
//const random = require('@pulumi/random');
/*
function generateRandomPassword() {
  return new random.RandomPassword('dbPassword', {
    length: 16, // Set the desired length of the password
    special: true, // Include special characters in the password
  }).result;
}
*/
/*
function generateValidRDSPassword(length) {
  const allowedChars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&*()_+-';

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allowedChars.length);
    password += allowedChars.charAt(randomIndex);
  }

  return password;
}*/

function generateValidRDSPassword() {
  const length = 16;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&*()_+-';

  let password = '';

  // Ensure at least one char of each type
  password += charset.charAt(Math.floor(Math.random() * 26)); // a-z
  password += charset.charAt(Math.floor(Math.random() * 26) + 26); // A-Z
  password += charset.charAt(Math.floor(Math.random() * 10) + 52); // 0-9
  password += charset.charAt(Math.floor(Math.random() * 14) + 62); // symbols

  // Fill remaining with random chars
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
}

async function createRDSPostgres(dbsecurityGroupId, dbSubnetGroupName) {
  const dbParameterGroup = await createRDSParameterGroup();
  //const randomPassword = generateRandomPassword();
  const strongPassword = generateValidRDSPassword();
  const rdsPostgres = new aws.rds.Instance('postgres', {
    engine: 'postgres',
    engineVersion: '14.6',
    instanceClass: 'db.t3.micro',
    identifier: 'csye6225',
    multiAz: false,
    username: 'csye6225',
    password: strongPassword,
    parameterGroupName: dbParameterGroup,
    dbName: 'csye6225',
    dbSubnetGroupName: dbSubnetGroupName,
    publiclyAccessible: false,
    vpcSecurityGroupIds: [dbsecurityGroupId],
    allocatedStorage: 10,
    maxAllocatedStorage: 50,
    skipFinalSnapshot: true,
    tags: {
      dbName: 'csye6225',
    },
  });
  return rdsPostgres;
}

module.exports = { createRDSPostgres };

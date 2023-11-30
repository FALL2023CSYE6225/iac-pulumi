const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
//const { dynamodb_table_name } = require('./variables');

async function createDynamo() {
  // Creating the DynamoDB table.
  const dynamodbTable = new aws.dynamodb.Table('dynamodb', {
    attributes: [
      { name: 'ID', type: 'S' },
      { name: 'Name', type: 'S' },
      { name: 'Email', type: 'S' },
      { name: 'Timestamp', type: 'S' },
      { name: 'Status', type: 'S' },
      { name: 'StatusDetails', type: 'S' },
    ],
    hashKey: 'ID',
    readCapacity: 5,
    writeCapacity: 5,
    globalSecondaryIndexes: [
      {
        name: 'NameIndex',
        hashKey: 'Name',
        projectionType: 'ALL',
        readCapacity: 5,
        writeCapacity: 5,
      },
      {
        name: 'EmailIndex',
        hashKey: 'Email',
        projectionType: 'ALL',
        readCapacity: 5,
        writeCapacity: 5,
      },
      {
        name: 'TimestampIndex',
        hashKey: 'Timestamp',
        projectionType: 'ALL',
        readCapacity: 5,
        writeCapacity: 5,
      },
      {
        name: 'StatusIndex',
        hashKey: 'Status',
        projectionType: 'ALL',
        readCapacity: 5,
        writeCapacity: 5,
      },
      {
        name: 'StatusDetailsIndex',
        hashKey: 'StatusDetails',
        projectionType: 'ALL',
        readCapacity: 5,
        writeCapacity: 5,
      },
    ],
  });
  return dynamodbTable;
}

// Extracting some properties for later use
//const dynamodbTableName = dynamodbTable.name;
//const dynamodbTableArn = dynamodbTable.arn;
module.exports = { createDynamo };

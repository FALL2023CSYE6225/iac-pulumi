const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const axios = require('axios');
//const fs = require('fs');
//const util = require('util');

async function downloadFile(url, localPath) {
  try {
    // Make an HTTP GET request to download the file
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    // Write the downloaded content to the local file
    await pulumi.runtime.writeFile(localPath, response.data, {
      parent: pulumi.runtime.rootPulumiStack,
    });
    return true;
  } catch (error) {
    return false;
    throw new Error(`Error downloading file: ${error.message}`);
  }
}
async function uploadToGCP(
  bucketName,
  sourceFilePath,
  destinationBlobName,
  credentialsDict
) {
  // Create a GCP Storage bucket
  const bucket = new gcp.storage.Bucket(bucketName);

  // Upload the file to GCP Storage
  await new gcp.storage.BucketObject(
    destinationBlobName,
    {
      bucket: bucket.name,
      source: new pulumi.asset.FileAsset(sourceFilePath),
    },
    { gcpKey: { credentials: credentialsDict } }
  );

  return destinationBlobName;
}
/*
const sendEmail = async (sesClient, recipient, subject, body) => {
  await sesClient
    .sendEmail({
      Source: 'Pramod Cloud <no-reply@pramod.cloud>',
      Destination: {
        ToAddresses: [recipient],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: body,
          },
        },
      },
    })
    .promise();
};*/

const tableName = process.env.DYNAMODB_TABLE_NAME;
if (!tableName) {
  throw new Error('DynamoDB table name not set in environment variables');
}

const table = new aws.dynamodb.Table(tableName);

const logEmailEvent = (name, email, eventType, details) => {
  const timestamp = new Date().toISOString();
  const eventId = pulumi.output(
    aws.lambda.invoke({
      functionName: 'generateUuidLambda',
    })
  );

  eventId.apply((id) => {
    table.putItem({
      EventID: id,
      Name: name,
      Email: email,
      Timestamp: timestamp,
      EventType: eventType,
      Details: details,
    });
  });
};

exports.lambdaHandler = async (event, context) => {
  //const sesClient = new aws.SES.Client();

  const message = JSON.parse(event.Records[0].Sns.Message);
  const { name, url, email } = message;

  const bucketName = process.env.GCP_BUCKET_NAME;
  const gcpCredentialsBase64 = process.env.GCP_CREDENTIALS;

  if (!(bucketName && gcpCredentialsBase64 && name && url)) {
    throw new Error('Missing required data');
  }

  const gcpCredentialsJson = Buffer.from(
    gcpCredentialsBase64,
    'base64'
  ).toString('utf-8');
  const credentials = JSON.parse(gcpCredentialsJson);

  const timestamp = new Date().toISOString();
  const localPath = `/tmp/${name}_${timestamp}.zip`;
  const destinationBlobName = `${name}_${timestamp}.zip`;
  try {
    // Download the file
    await downloadFile(url, localPath);

    // Upload the file to GCP
    const uploadedFile = await uploadToGCP(
      bucketName,
      localPath,
      destinationBlobName,
      credentials
    );

    // Send success email
    //const successSubject = 'File Download and Upload Successful';
    //const successBody = `Hello ${name},\n\nThe file has been successfully downloaded and uploaded to GCP Bucket.\n\nBest Regards,\nPramod Cloud`;
    //await sendEmail(email, successSubject, successBody);
  } catch (error) {
    // Send failure email
    // const failureSubject = 'File Download Failed';
    //const failureBody = `Hello ${name},\n\nThere was an error downloading the file, please resubmit it.\n\nBest Regards,\nPramod Cloud`;
    //await sendEmail(email, failureSubject, failureBody);
    // Re-throw the exception to notify Cloud Functions of the failure
    //throw error;
  }

  /*(return {
    statusCode: 200,
    body: JSON.stringify('File processing completed'),
  };*/
};

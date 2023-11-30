const pulumi = require('@pulumi/pulumi');
const gcp = require('@pulumi/gcp');
const config = new pulumi.Config();

async function gcpBucketCreate() {
  const bucket = new gcp.storage.Bucket('my-bucket', {
    location: 'US',
    forceDestroy: true,
  });
  return bucket.name;
}

async function gcpCloudResources(bucketName) {
  const gcpServiceAccount = new gcp.serviceaccount.Account(
    'my-service-account',
    {
      accountId: 'dev-ajit',
      displayName: 'My Service Account',
    }
  );

  // Allow service account to upload objects
  const gcpBucketIAM = new gcp.storage.BucketIAMMember('bucket-admin', {
    bucket: bucketName,
    role: 'roles/storage.admin',
    member: pulumi.interpolate`serviceAccount:${gcpServiceAccount.email}`,
  });

  // Create access key
  const gcpAccessKey = new gcp.serviceaccount.Key('my-access-key', {
    serviceAccountId: gcpServiceAccount.name,
    publicKeyType: 'TYPE_X509_PEM_FILE',
  });

  return gcpAccessKey.privateKey;
}

module.exports = { gcpBucketCreate, gcpCloudResources };

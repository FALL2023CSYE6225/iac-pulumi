module.exports = {
  instanceConfig: {
    instanceType: 't2.micro',
    keyName: 'KeyPair',
    rootBlockDevice: {
      volumeSize: 25,
      volumeType: 'gp2',
      deleteOnTermination: true,
    },
    disableApiTermination: false,
    tags: {
      Name: 'EC2-AMI',
    },
  },
};

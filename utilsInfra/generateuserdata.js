function generateUserData(
  nodePort,
  dbFullEndpoint,
  dbUsername,
  strongPassword,
  dbName,
  dbDialect
) {
  const [dbHost, dbPort] = dbFullEndpoint.split(':');
  return `#!/bin/bash
  sudo echo PORT="${nodePort}" >> /etc/environment
  sudo echo DB_HOST="${dbHost}" >> /etc/environment
  sudo echo DB_PORT="${dbPort}" >> /etc/environment
  sudo echo DB_USER="${dbUsername}" >> /etc/environment
  sudo echo DB_PASSWORD="${strongPassword}" >> /etc/environment
  sudo echo DB_NAME="${dbName}" >> /etc/environment
  sudo echo DB_DIALECT="${dbDialect}" >> /etc/environment
  sudo systemctl daemon-reload
  `;
}

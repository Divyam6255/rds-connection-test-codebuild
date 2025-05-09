const mysql = require('mysql2/promise');
const dns = require('dns').promises;
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

(async () => {
  try {
    // Set environment variables (or pass them from CodeBuild environment)
    const REGION = process.env.REGION || 'us-west-1';
    const SECRET_NAME = process.env.SECRET_NAME || 'rds-db-credentials';

    // Fetch RDS credentials from Secrets Manager
    const client = new SecretsManagerClient({ region: REGION });
    const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });
    const response = await client.send(command);
    const creds = JSON.parse(response.SecretString);

    // Connect to RDS and execute a simple query
    const connection = await mysql.createConnection({
      host: creds.host,
      user: creds.username,
      password: creds.password,
      database: creds.dbname,
      port: creds.port || 3306
    });
    const [rows] = await connection.query('SELECT NOW() AS now');
    await connection.end();

    // Attempt a DNS lookup to check Internet connectivity
    const dnsResult = await dns.lookup('google.com');

    // Optionally, log output (or comment these out to reduce output)
    console.log('Database connected. Now:', rows[0].now);
    console.log('Internet check succeeded. Google IP:', dnsResult.address);

    // Exit with success
    process.exit(0);
  } catch (err) {
    console.error('Connectivity test failed:', err.message);
    // Ensure the build fails by exiting with a non-zero code.
    process.exit(1);
  }
})();

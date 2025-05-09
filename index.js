<<<<<<< HEAD
=======
// testConnectivity.js

>>>>>>> 8271c6966fa7a15ddc6322c38dfa724e1c87be85
const dns = require('dns').promises;
const mysql = require('mysql2/promise');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Use environment variables or defaults
const REGION = process.env.REGION || 'us-west-1';
const SECRET_NAME = process.env.SECRET_NAME || 'rds-db-credentials';

// Fetch database credentials from Secrets Manager
async function getSecret() {
  const client = new SecretsManagerClient({ region: REGION });
  const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });
  const response = await client.send(command);
  return JSON.parse(response.SecretString);
}

// Establish a database connection using mysql2
async function getConnection() {
  const creds = await getSecret();
  return mysql.createConnection({
    host: creds.host,
    user: creds.username,
    password: creds.password,
    database: creds.dbname,
    port: creds.port || 3306,
  });
}

// Main function to run connectivity tests
async function testConnectivity() {
  try {
    // Test RDS connectivity by executing a simple query.
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT NOW() AS now');
    const dbTime = rows[0].now;
    await conn.end();

    // If RDS connection succeeded, check Internet connectivity using DNS lookup.
    let internetStatus = "Connected";
    let googleIP = "";
    try {
      const dnsResult = await dns.lookup('google.com');
      googleIP = dnsResult.address;
    } catch (dnsErr) {
      internetStatus = "Not connected";
      googleIP = "Not connected to Internet";
    }

    console.log('Connectivity Test Succeeded:');
    console.log('--------------------------------');
    console.log('Database Time:', dbTime);
    console.log('Internet Status:', internetStatus);
    console.log('Google IP:', googleIP);
    process.exit(0);
  } catch (err) {
    console.error('Connectivity Test Failed!');
    console.error('--------------------------------');
    console.error('Unable to connect to RDS and/or Internet');
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Run the connectivity test if this file is executed directly.
<<<<<<< HEAD
testConnectivity();
=======
testConnectivity();
>>>>>>> 8271c6966fa7a15ddc6322c38dfa724e1c87be85

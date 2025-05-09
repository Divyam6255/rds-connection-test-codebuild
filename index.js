const express = require('express');
const dns = require('dns').promises;
const mysql = require('mysql2/promise');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const app = express();

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

// Establish a database connection
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

// Express route: Connect to RDS, perform DNS lookup, and show statuses accordingly
app.get('/', async (req, res) => {
  let dbTime;
  let googleIP;
  try {
    // Attempt to connect to RDS and fetch the current time
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT NOW() AS now');
    dbTime = rows[0].now;
    await conn.end();
    
    // If RDS connection succeeded, perform DNS lookup
    try {
      const dnsResult = await dns.lookup('google.com');
      googleIP = dnsResult.address;
    } catch (dnsErr) {
      // In case DNS lookup fails, mark internet as inaccessible
      googleIP = "Not connected to Internet";
    }
    


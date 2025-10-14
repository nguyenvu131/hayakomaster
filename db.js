const { Pool } = require('pg');

const pool = new Pool({
  host: 'yourdb.aivencloud.com',
  port: 12345,
  database: 'defaultdb',
  user: 'avnadmin',
  password: 'your_password',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;

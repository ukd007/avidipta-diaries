const mysql = require('mysql2');
const fs = require('fs');

const caCert = fs.readFileSync('./config/ca.pem');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB1,
    ssl: {
        ca: caCert
    }
});


connection.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to Aiven MySQL');
  }
});

module.exports = connection;

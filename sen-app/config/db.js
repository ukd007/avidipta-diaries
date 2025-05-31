const mysql = require('mysql2');
const fs = require('fs');

const caCert = fs.readFileSync('./config/ca.pem');

const connection = mysql.createConnection({
    host: 'mysql-3cce6bb-our-60c4.g.aivencloud.com',
    port: 21893,
    user: 'avnadmin',
    password: 'AVNS_mRuJWqpte6kVpPA6zT1',
    database: 'avidipta_diaries',
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

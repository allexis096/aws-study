'use strict';

module.exports.getCustomers = async (event) => {
  const mysql = require('mysql');
  const connection = mysql.createConnection({
    host: 'host',
    user: 'user',
    password: 'password',
    database: 'database'
  })

  const promise = new Promise((resolve) => {
    connection.query('SELECT * FROM customers', (err, results) => {
      resolve(results);
    });
  });

  const result = await promise;

  return {
    statusCode: 200,
    body: JSON.stringify({ results: result }),
  };
};

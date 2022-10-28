const mysql = require('promise-mysql');

const createTcpPool = async config => {
  const dbConfig = {
    host: process.env.HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  };
  // Establish a connection to the database.
  return mysql.createPool(dbConfig);
};

exports.default = createTcpPool
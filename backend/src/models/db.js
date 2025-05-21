const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: dbConfig.pool.max,
  queueLimit: 0
});

async function query(sql, params) {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    logger.error(`Database Error: ${error.message}`);
    throw error;
  }
}

// Test the connection
pool.getConnection()
  .then(connection => {
    logger.info('Successfully connected to the MySQL database.');
    connection.release();
  })
  .catch(err => {
    logger.error('Database Connection Error:', err);
  });

module.exports = { query };
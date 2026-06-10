import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'task_manager',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute a query with optional parameters
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export const executeQuery = async (query, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(query, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Query took ${duration}ms:`, query);
    }
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

/**
 * Get a single row from query
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Single row result
 */
export const getOne = async (query, params = []) => {
  const result = await executeQuery(query, params);
  return result.rows[0] || null;
};

/**
 * Get multiple rows from query
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of rows
 */
export const getMany = async (query, params = []) => {
  const result = await executeQuery(query, params);
  return result.rows;
};

/**
 * Insert a row and return the new record
 * @param {string} query - SQL INSERT query with RETURNING clause
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} New record
 */
export const insertOne = async (query, params = []) => {
  const result = await executeQuery(query, params);
  return result.rows[0];
};

/**
 * Perform a transaction
 * @param {Function} callback - Async function with query executor
 * @returns {Promise<any>} Transaction result
 */
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Close database connection pool
 */
export const closePool = async () => {
  await pool.end();
};

export default pool;

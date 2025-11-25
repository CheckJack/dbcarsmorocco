import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Log database configuration (without password)
console.log('📊 Database Configuration:');
console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
console.log(`   Database: ${process.env.DB_NAME || 'dbcars_db'}`);
console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : '(empty)'}`);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dbcars_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 seconds - increased for reliability
});

pool.on('error', (err: any) => {
  console.error('❌ Unexpected error on idle database client:', err);
  console.error('   Error code:', err.code || 'N/A');
  console.error('   Error message:', err.message || err);
  // Don't exit immediately - let the application handle it
  // process.exit(-1);
});

/**
 * Test database connection with timeout
 * @returns Promise<boolean> - true if connection successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  const CONNECTION_TIMEOUT = 10000; // 10 seconds timeout (increased for reliability)
  let client: any = null;
  let timeoutId: NodeJS.Timeout | null = null;
  
  try {
    const connectionPromise = (async () => {
      try {
        client = await pool.connect();
        await client.query('SELECT 1');
        console.log('✅ Database connection successful!');
        return true;
      } catch (error: any) {
        console.error('❌ Database connection test failed:');
        console.error('   Error code:', error.code || 'N/A');
        console.error('   Error message:', error.message || error);
        if (error.code === 'ECONNREFUSED') {
          console.error('   → PostgreSQL server is not running or not accessible');
        } else if (error.code === '28P01') {
          console.error('   → Authentication failed - check username and password');
        } else if (error.code === '3D000') {
          console.error('   → Database does not exist');
        } else if (error.code === 'ENOTFOUND') {
          console.error('   → Database host not found');
        }
        return false;
      } finally {
        if (client) {
          client.release();
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    })();

    const timeoutPromise = new Promise<boolean>((resolve) => {
      timeoutId = setTimeout(() => {
        console.error(`Database connection test timed out after ${CONNECTION_TIMEOUT}ms`);
        if (client) {
          client.release().catch(() => {}); // Try to release if connection was established
        }
        resolve(false);
      }, CONNECTION_TIMEOUT);
    });

    const result = await Promise.race([connectionPromise, timeoutPromise]);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    return result as boolean;
  } catch (error: any) {
    console.error('Database connection test error:', error.message || error);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (client) {
      client.release().catch(() => {});
    }
    return false;
  }
}

export default pool;


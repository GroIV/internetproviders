import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

// Only throw error if we're trying to use the database
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  // Create a connection pool
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Create drizzle instance
  db = drizzle(pool, { schema });
}

// Export a getter that throws if database is not configured
export function getDb() {
  if (!db) {
    throw new Error('Database not configured. Please set DATABASE_URL environment variable.');
  }
  return db;
}

// Export for compatibility but it might be null
export { db };

// Test database connection
export async function testConnection() {
  if (!pool) {
    console.log('No DATABASE_URL configured, skipping database connection test');
    return false;
  }
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (pool) {
    await pool.end();
  }
  process.exit(0);
}); 
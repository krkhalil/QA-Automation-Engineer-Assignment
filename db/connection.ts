/**
 * PostgreSQL connection pool.
 * Use getPool() for queries; call closePool() when shutting down (e.g. in afterAll).
 */

import { Pool, PoolClient } from 'pg';
import { dbConfig } from './config';

let pool: Pool | null = null;

/**
 * Returns the shared connection pool. Creates it on first use.
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: dbConfig.connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

/**
 * Gets a client from the pool for transactions. Call client.release() when done.
 */
export async function getClient(): Promise<PoolClient> {
  return getPool().connect();
}

/**
 * Closes the pool. Call in afterAll() or when the process exits.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

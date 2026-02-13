/**
 * Database connection. Uses PostgreSQL by default; SQLite when USE_SQLITE=1.
 */

import { Pool, PoolClient } from 'pg';
import Database from 'better-sqlite3';
import { dbConfig } from './config';

let pool: Pool | null = null;
let sqliteDb: Database.Database | null = null;

/** When true, CRUD uses SQLite instead of PostgreSQL. */
export let isSqliteMode = dbConfig.useSqlite;

export function setSqliteMode(value: boolean): void {
  isSqliteMode = value;
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: dbConfig.connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

export function getSqliteDb(): Database.Database {
  if (!sqliteDb) {
    sqliteDb = new Database(dbConfig.databasePath);
  }
  return sqliteDb;
}

export async function getClient(): Promise<PoolClient> {
  return getPool().connect();
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
}

/**
 * Database configuration.
 * PostgreSQL: set DATABASE_URL (default: postgresql://postgres:mypassword@localhost:5432/mydatabase)
 * SQLite: set USE_SQLITE=1, optional DATABASE_PATH (default: ./db/test.db)
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const DEFAULT_PG_URL = 'postgresql://postgres:mypassword@localhost:5432/mydatabase';
const DEFAULT_SQLITE_PATH = path.join(process.cwd(), 'db', 'test.db');

export const dbConfig = {
  connectionString: process.env.DATABASE_URL ?? DEFAULT_PG_URL,
  databasePath: process.env.DATABASE_PATH ?? DEFAULT_SQLITE_PATH,
  useSqlite: process.env.USE_SQLITE === '1',
} as const;

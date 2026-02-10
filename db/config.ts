/**
 * PostgreSQL database configuration.
 *
 * Connection string format:
 *   postgresql://postgres:mypassword@localhost:5432/mydatabase
 *
 * Set DATABASE_URL in your environment or in a .env file in the project root.
 */

import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_URL = 'postgresql://postgres:mypassword@localhost:5432/mydatabase';

export const dbConfig = {
  /** PostgreSQL connection URL. Override with DATABASE_URL env var. */
  connectionString: process.env.DATABASE_URL ?? DEFAULT_URL,
} as const;

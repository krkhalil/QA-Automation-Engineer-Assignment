/**
 * CRUD operations for the demo table.
 *
 * Table: demo_items
 *   - id          SERIAL PRIMARY KEY
 *   - name        VARCHAR(255) NOT NULL
 *   - description TEXT
 *   - created_at  TIMESTAMP DEFAULT NOW()
 *
 * Use initTable() once (e.g. in beforeAll) to create the table.
 */

import { Pool } from 'pg';
import { getPool } from './connection';

export const TABLE_NAME = 'demo_items';

export interface DemoItem {
  id?: number;
  name: string;
  description: string | null;
  created_at?: Date;
}

/**
 * Creates the demo_items table if it does not exist.
 */
export async function initTable(pool?: Pool): Promise<void> {
  const p = pool ?? getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      created_at  TIMESTAMP DEFAULT NOW()
    )
  `);
}

/**
 * Create: insert a new row. Returns the created row with id and created_at.
 */
export async function create(
  item: Pick<DemoItem, 'name' | 'description'>,
  pool?: Pool
): Promise<DemoItem> {
  const p = pool ?? getPool();
  const result = await p.query<DemoItem>(
    `INSERT INTO ${TABLE_NAME} (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at`,
    [item.name, item.description ?? null]
  );
  return result.rows[0];
}

/**
 * Read: fetch a single row by id, or null if not found.
 */
export async function read(id: number, pool?: Pool): Promise<DemoItem | null> {
  const p = pool ?? getPool();
  const result = await p.query<DemoItem>(
    `SELECT id, name, description, created_at FROM ${TABLE_NAME} WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

/**
 * Read all: fetch all rows, optionally ordered by id.
 */
export async function readAll(pool?: Pool): Promise<DemoItem[]> {
  const p = pool ?? getPool();
  const result = await p.query<DemoItem>(
    `SELECT id, name, description, created_at FROM ${TABLE_NAME} ORDER BY id`
  );
  return result.rows;
}

/**
 * Update: update name and/or description by id. Returns the updated row or null.
 */
export async function update(
  id: number,
  updates: Partial<Pick<DemoItem, 'name' | 'description'>>,
  pool?: Pool
): Promise<DemoItem | null> {
  const p = pool ?? getPool();
  const result = await p.query<DemoItem>(
    `UPDATE ${TABLE_NAME} SET name = COALESCE($2, name), description = COALESCE($3, description) WHERE id = $1 RETURNING id, name, description, created_at`,
    [id, updates.name ?? null, updates.description ?? null]
  );
  return result.rows[0] ?? null;
}

/**
 * Delete: remove a row by id. Returns true if a row was deleted.
 */
export async function remove(id: number, pool?: Pool): Promise<boolean> {
  const p = pool ?? getPool();
  const result = await p.query(`DELETE FROM ${TABLE_NAME} WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

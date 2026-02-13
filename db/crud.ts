/**
 * CRUD operations for demo_items table.
 */

import { Pool } from 'pg';
import { getPool, getSqliteDb, isSqliteMode } from './connection';

export const TABLE_NAME = 'demo_items';

export interface DemoItem {
  id?: number;
  name: string;
  description: string | null;
  created_at?: Date | string;
}

/** PostgreSQL: create table */
async function initTablePg(p?: Pool): Promise<void> {
  const p_ = p ?? getPool();
  await p_.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      created_at  TIMESTAMP DEFAULT NOW()
    )
  `);
}

/** SQLite: create table */
function initTableSqlite(): void {
  const db = getSqliteDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT,
      created_at  TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function initTable(pool?: Pool): Promise<void> {
  if (isSqliteMode) {
    initTableSqlite();
    return;
  }
  await initTablePg(pool);
}

export async function create(
  item: Pick<DemoItem, 'name' | 'description'>,
  pool?: Pool
): Promise<DemoItem> {
  if (isSqliteMode) {
    const db = getSqliteDb();
    const stmt = db.prepare(
      `INSERT INTO ${TABLE_NAME} (name, description) VALUES (?, ?)`
    );
    const result = stmt.run(item.name, item.description ?? null);
    const row = read(result.lastInsertRowid as number);
    return row!;
  }
  const p = pool ?? getPool();
  const result = await p.query<DemoItem>(
    `INSERT INTO ${TABLE_NAME} (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at`,
    [item.name, item.description ?? null]
  );
  return result.rows[0];
}

export async function read(id: number, pool?: Pool): Promise<DemoItem | null> {
  if (isSqliteMode) {
    const db = getSqliteDb();
    const stmt = db.prepare(
      `SELECT id, name, description, created_at FROM ${TABLE_NAME} WHERE id = ?`
    );
    const row = stmt.get(id) as DemoItem | undefined;
    return row ?? null;
  }
  const p = pool ?? getPool();
  const result = await p.query<DemoItem>(
    `SELECT id, name, description, created_at FROM ${TABLE_NAME} WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function readAll(pool?: Pool): Promise<DemoItem[]> {
  if (isSqliteMode) {
    const db = getSqliteDb();
    const stmt = db.prepare(
      `SELECT id, name, description, created_at FROM ${TABLE_NAME} ORDER BY id`
    );
    return stmt.all() as DemoItem[];
  }
  const p = pool ?? getPool();
  const result = await p.query<DemoItem>(
    `SELECT id, name, description, created_at FROM ${TABLE_NAME} ORDER BY id`
  );
  return result.rows;
}

export async function update(
  id: number,
  updates: Partial<Pick<DemoItem, 'name' | 'description'>>,
  pool?: Pool
): Promise<DemoItem | null> {
  if (isSqliteMode) {
    const existing = await read(id);
    if (!existing) return null;
    const name = updates.name ?? existing.name;
    const description =
      updates.description !== undefined ? updates.description : existing.description;
    const db = getSqliteDb();
    db.prepare(
      `UPDATE ${TABLE_NAME} SET name = ?, description = ? WHERE id = ?`
    ).run(name, description, id);
    return read(id);
  }
  const p = pool ?? getPool();
  const result = await p.query<DemoItem>(
    `UPDATE ${TABLE_NAME} SET name = COALESCE($2, name), description = COALESCE($3, description) WHERE id = $1 RETURNING id, name, description, created_at`,
    [id, updates.name ?? null, updates.description ?? null]
  );
  return result.rows[0] ?? null;
}

export async function remove(id: number, pool?: Pool): Promise<boolean> {
  if (isSqliteMode) {
    const db = getSqliteDb();
    const result = db.prepare(`DELETE FROM ${TABLE_NAME} WHERE id = ?`).run(id);
    return result.changes > 0;
  }
  const p = pool ?? getPool();
  const result = await p.query(`DELETE FROM ${TABLE_NAME} WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

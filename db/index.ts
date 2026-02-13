/**
 * PostgreSQL database layer.
 *
 * Usage:
 *   import { initTable, create, read, update, remove, closePool } from './db';
 *   await initTable();
 *   const row = await create({ name: 'Item', description: 'Desc' });
 *   await update(row.id!, { name: 'Updated' });
 *   await remove(row.id!);
 *   await closePool();
 */

export { dbConfig } from './config';
export { getPool, getClient, closePool, setSqliteMode } from './connection';
export {
  initTable,
  create,
  read,
  readAll,
  update,
  remove,
  TABLE_NAME,
  type DemoItem,
} from './crud';

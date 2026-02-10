/**
 * PostgreSQL CRUD tests.
 *
 * Prerequisites:
 *   - PostgreSQL running at localhost:5432 (or set DATABASE_URL)
 *   - Database and user from connection string (e.g. postgres/mypassword/mydatabase)
 *
 * Run: npm run test:db   or   npx playwright test tests/db-crud.spec.ts
 *
 * If PostgreSQL is not available, tests are skipped with a clear message.
 */

import { test, expect } from '@playwright/test';
import {
  initTable,
  create,
  read,
  readAll,
  update,
  remove,
  closePool,
} from '../db';

let dbAvailable = false;

test.describe('PostgreSQL CRUD operations', () => {
  test.beforeAll(async () => {
    try {
      await initTable();
      dbAvailable = true;
    } catch {
      dbAvailable = false;
      await closePool();
      console.warn(
        'PostgreSQL not available — skipping DB tests. Set DATABASE_URL and ensure Postgres is running.'
      );
    }
  });

  test.afterAll(async () => {
    await closePool();
  });

  test('Create: insert a new row and get id', async () => {
    test.skip(!dbAvailable, 'PostgreSQL not available');
    const created = await create({
      name: 'First Item',
      description: 'Created by CRUD test',
    });
    expect(created).toBeDefined();
    expect(created!.id).toBeDefined();
    expect(created!.name).toBe('First Item');
    expect(created!.description).toBe('Created by CRUD test');
    expect(created!.created_at).toBeDefined();
  });

  test('Read: fetch row by id', async () => {
    test.skip(!dbAvailable, 'PostgreSQL not available');
    const created = await create({ name: 'Read Test', description: null });
    const found = await read(created!.id!);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(created!.id);
    expect(found!.name).toBe('Read Test');
    expect(found!.description).toBeNull();
  });

  test('Read: returns null for missing id', async () => {
    test.skip(!dbAvailable, 'PostgreSQL not available');
    const found = await read(999999);
    expect(found).toBeNull();
  });

  test('Read All: fetch all rows', async () => {
    test.skip(!dbAvailable, 'PostgreSQL not available');
    const before = await readAll();
    await create({ name: 'All Test', description: 'For readAll' });
    const after = await readAll();
    expect(after.length).toBe(before.length + 1);
    const added = after.find((r) => r.name === 'All Test');
    expect(added).toBeDefined();
  });

  test('Update: change name and description', async () => {
    test.skip(!dbAvailable, 'PostgreSQL not available');
    const created = await create({
      name: 'Before Update',
      description: 'Original',
    });
    const updated = await update(created!.id!, {
      name: 'After Update',
      description: 'Modified',
    });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe('After Update');
    expect(updated!.description).toBe('Modified');
    const found = await read(created!.id!);
    expect(found!.name).toBe('After Update');
  });

  test('Delete: remove row by id', async () => {
    test.skip(!dbAvailable, 'PostgreSQL not available');
    const created = await create({ name: 'To Delete', description: null });
    const deleted = await remove(created!.id!);
    expect(deleted).toBe(true);
    const found = await read(created!.id!);
    expect(found).toBeNull();
  });

  test('Delete: returns false for missing id', async () => {
    test.skip(!dbAvailable, 'PostgreSQL not available');
    const deleted = await remove(999999);
    expect(deleted).toBe(false);
  });
});

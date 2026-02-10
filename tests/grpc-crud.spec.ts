/**
 * gRPC CRUD tests against grpcb.in (https://grpcb.in/).
 *
 * Run: npm run test:grpc   or   npx playwright test tests/grpc-crud.spec.ts
 *
 * If the gRPC endpoint is unreachable, tests are skipped.
 */

import { test, expect } from '@playwright/test';
import {
  create,
  read,
  update,
  remove,
  closeCrudClient,
  getCrudClient,
} from '../grpc';

let grpcAvailable = false;

test.describe('gRPC CRUD operations (grpcb.in)', () => {
  test.beforeAll(async () => {
    try {
      const crud = getCrudClient();
      await crud.create({ uuid: '', string_value: 'ping' });
      grpcAvailable = true;
    } catch {
      grpcAvailable = false;
      closeCrudClient();
      console.warn(
        'grpcb.in not reachable — skipping gRPC tests. Check network and GRPC_TARGET.'
      );
    }
  });

  test.afterAll(async () => {
    closeCrudClient();
  });

  test('Create: create resource and get uuid', async () => {
    test.skip(!grpcAvailable, 'grpcb.in not available');
    const created = await create({
      string_value: 'test-create',
    });
    expect(created).toBeDefined();
    expect(created.uuid).toBeDefined();
    expect(created.uuid.length).toBeGreaterThan(0);
  });

  test('Read: lookup by uuid', async () => {
    test.skip(!grpcAvailable, 'grpcb.in not available');
    const created = await create({ string_value: 'read-test' });
    const found = await read(created.uuid);
    expect(found).not.toBeNull();
    expect(found!.uuid).toBe(created.uuid);
  });

  test('Read: returns null for missing uuid', async () => {
    test.skip(!grpcAvailable, 'grpcb.in not available');
    const found = await read('00000000-0000-0000-0000-000000000000');
    expect(found).toBeNull();
  });

  test('Update: update string_value', async () => {
    test.skip(!grpcAvailable, 'grpcb.in not available');
    const created = await create({ string_value: 'before' });
    await update(created.uuid, { string_value: 'after' });
    const found = await read(created.uuid);
    expect(found).not.toBeNull();
    expect(found!.string_value).toBe('after');
  });

  test('Delete: remove by uuid', async () => {
    test.skip(!grpcAvailable, 'grpcb.in not available');
    const created = await create({ string_value: 'to-delete' });
    await remove(created.uuid);
    const found = await read(created.uuid);
    expect(found).toBeNull();
  });
});

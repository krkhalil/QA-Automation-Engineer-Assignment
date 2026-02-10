/**
 * CRUD operations for grpcb.in ABitOfEverythingService.
 *
 * - Create: create a resource (returns created item with uuid)
 * - Read:   lookup by uuid
 * - Update: update by uuid
 * - Delete: delete by uuid
 *
 * Uses a single shared client; call close() when done (e.g. in afterAll).
 */

import { createClient, GrpcClientInstance } from './client';
import type { ChannelCredentials } from '@grpc/grpc-js';

export interface AbitOfEverything {
  uuid: string;
  string_value?: string;
}

let sharedCrud: GrpcClientInstance | null = null;
let sharedClient: { close: () => void } | null = null;

/**
 * Get the shared CRUD client. Creates it on first use.
 * Prefer getCrudClient() in tests and closeCrudClient() in afterAll.
 */
export function getCrudClient(): GrpcClientInstance {
  if (!sharedCrud) {
    const { client, crud } = createClient();
    sharedClient = client;
    sharedCrud = crud;
  }
  return sharedCrud;
}

/**
 * Close the shared gRPC client. Call in afterAll() or when done.
 */
export function closeCrudClient(): void {
  if (sharedClient) {
    sharedClient.close();
    sharedClient = null;
    sharedCrud = null;
  }
}

/**
 * Create: send an ABitOfEverything; server returns it (with uuid if generated).
 */
export async function create(
  item: Partial<AbitOfEverything>
): Promise<AbitOfEverything> {
  const crud = getCrudClient();
  const result = await crud.create({
    uuid: item.uuid ?? '',
    string_value: item.string_value ?? '',
  });
  return { uuid: result.uuid, string_value: result.string_value };
}

/**
 * Read: lookup by uuid. Returns null if not found.
 */
export async function read(uuid: string): Promise<AbitOfEverything | null> {
  const crud = getCrudClient();
  const result = await crud.lookup({ uuid });
  if (!result) return null;
  return { uuid: result.uuid, string_value: result.string_value };
}

/**
 * Update: update resource by uuid.
 */
export async function update(
  uuid: string,
  updates: Partial<Pick<AbitOfEverything, 'string_value'>>
): Promise<void> {
  const crud = getCrudClient();
  await crud.update({
    uuid,
    string_value: updates.string_value ?? undefined,
  });
}

/**
 * Delete: remove resource by uuid.
 */
export async function remove(uuid: string): Promise<void> {
  const crud = getCrudClient();
  await crud.delete({ uuid });
}

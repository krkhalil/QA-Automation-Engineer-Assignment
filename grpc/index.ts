/**
 * gRPC CRUD layer for grpcb.in (https://grpcb.in/).
 *
 * Usage:
 *   import { create, read, update, remove, closeCrudClient } from './grpc';
 *   const item = await create({ string_value: 'hello' });
 *   const found = await read(item.uuid);
 *   await update(item.uuid, { string_value: 'updated' });
 *   await remove(item.uuid);
 *   closeCrudClient();
 */

export { grpcConfig } from './config';
export { createClient } from './client';
export type { GrpcClientInstance } from './client';
export {
  getCrudClient,
  closeCrudClient,
  create,
  read,
  update,
  remove,
  type AbitOfEverything,
} from './crud';

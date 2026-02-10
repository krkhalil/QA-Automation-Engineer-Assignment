/**
 * gRPC client for grpcb.in ABitOfEverythingService.
 * Loads proto and exposes the raw service client.
 */

import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import * as protoLoader from '@grpc/proto-loader';
import { grpcConfig } from './config';

const PROTO_PATH = path.join(__dirname, '../proto/a_bit_of_everything.proto');
const PROTO_OPTIONS: protoLoader.Options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(__dirname, '../proto')],
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, PROTO_OPTIONS);
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const packagePath = 'grpc.gateway.examples.examplepb';
const serviceName = 'ABitOfEverythingService';
const Service = packagePath
  .split('.')
  .reduce((o: any, k: string) => o?.[k], proto)?.[serviceName];

if (!Service) {
  throw new Error(
    `gRPC service not found: ${packagePath}.${serviceName}. Check proto load.`
  );
}

export interface GrpcClientInstance {
  create: (request: { uuid?: string; string_value?: string }) => Promise<{ uuid: string; string_value?: string }>;
  lookup: (request: { uuid: string }) => Promise<{ uuid: string; string_value?: string } | null>;
  update: (request: { uuid: string; string_value?: string }) => Promise<void>;
  delete: (request: { uuid: string }) => Promise<void>;
}

function promisify<T, R>(fn: (req: T, cb: (err: grpc.ServiceError | null, res: R) => void) => void) {
  return (req: T): Promise<R> =>
    new Promise((resolve, reject) => {
      fn.call(null, req, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
}

/**
 * Create a gRPC client for ABitOfEverythingService.
 * Call close() when done to release resources.
 */
export function createClient(): { client: grpc.Client; crud: GrpcClientInstance } {
  const credentials = grpcConfig.useTls
    ? grpc.credentials.createSsl()
    : grpc.credentials.createInsecure();

  const client = new Service(grpcConfig.resolvedTarget, credentials);

  const crud: GrpcClientInstance = {
    create: promisify(client.Create.bind(client)),
    lookup: (req) =>
      promisify(client.Lookup.bind(client))(req).catch((err: grpc.ServiceError) => {
        if (err.code === grpc.status.NOT_FOUND || err.code === grpc.status.UNKNOWN) return null;
        throw err;
      }),
    update: promisify(client.Update.bind(client)),
    delete: promisify(client.Delete.bind(client)),
  };

  return { client, crud };
}

/**
 * gRPC client configuration for grpcb.in
 *
 * Endpoint: https://grpcb.in/
 * - Without TLS: grpcb.in:9000
 * - With TLS:    grpcb.in:9001
 *
 * Override with GRPC_TARGET env var (e.g. localhost:50051).
 */

const DEFAULT_TARGET = 'grpcb.in:9000';
const DEFAULT_TARGET_TLS = 'grpcb.in:9001';

export const grpcConfig = {
  /** gRPC target (host:port). Use GRPC_TARGET to override. */
  target: process.env.GRPC_TARGET ?? DEFAULT_TARGET,
  /** Use TLS (e.g. for grpcb.in:9001). Set GRPC_USE_TLS=1 to use TLS. */
  useTls: process.env.GRPC_USE_TLS === '1',
  /** Resolved target (when useTls, defaults to 9001). */
  get resolvedTarget(): string {
    if (process.env.GRPC_TARGET) return process.env.GRPC_TARGET;
    return this.useTls ? DEFAULT_TARGET_TLS : DEFAULT_TARGET;
  },
} as const;

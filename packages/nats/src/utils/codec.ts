import { JSONCodec } from 'nats';

const codec = JSONCodec<unknown>();

export function encodeJson<T>(v: T): Uint8Array {
  return codec.encode(v as unknown);
}

export function decodeJson<T>(bytes: Uint8Array): T {
  return codec.decode(bytes) as T;
}

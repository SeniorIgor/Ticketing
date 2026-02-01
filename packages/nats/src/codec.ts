import { JSONCodec } from 'nats';

const jc = JSONCodec<unknown>();

export function encodeJson<T>(v: T): Uint8Array {
  return jc.encode(v as unknown);
}

export function decodeJson<T>(bytes: Uint8Array): T {
  return jc.decode(bytes) as T;
}

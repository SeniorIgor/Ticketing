import { StringCodec } from 'nats';

const codec = StringCodec();

export function safeDecodeRaw(data: Uint8Array): string {
  try {
    return codec.decode(data);
  } catch {
    return '[un-decodable-bytes]';
  }
}

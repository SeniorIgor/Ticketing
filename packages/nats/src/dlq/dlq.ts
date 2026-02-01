import { encodeJson } from '../codec';
import { getNats } from '../connection';

import type { DeadLetterRecord } from './types';

export async function publishDeadLetter(subject: string, record: DeadLetterRecord) {
  const { client } = getNats();

  await client.publish(subject, encodeJson(record));
}

import { encodeJson } from '../codec';
import { getNats } from '../connection';

import type { DeadLetterRecord } from './types';

export async function publishDeadLetter(subject: string, record: DeadLetterRecord) {
  const { js } = getNats();
  await js.publish(subject, encodeJson(record));
}

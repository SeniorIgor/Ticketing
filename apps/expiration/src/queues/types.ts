import type { Queue } from 'bullmq';

import type { ExpirationJobName, ExpireOrderJobData } from './expiration.schema';

export type ExpirationQueue = Queue<ExpireOrderJobData, void, ExpirationJobName>;

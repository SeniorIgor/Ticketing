import type { ConnectionOptions } from 'nats';

import type { Logger } from '@org/core';
import { createLogger } from '@org/core';

export interface NatsConnectConfig {
  servers: string | string[];
  name: string;
  logger?: Logger;
  connectionOptions?: Omit<ConnectionOptions, 'servers' | 'name'>;
}

export type NatsRuntime = {
  logger: Logger;
};

export function normalizeConfig(config: NatsConnectConfig): Required<NatsRuntime> & NatsConnectConfig {
  return {
    ...config,
    logger: config.logger ?? createLogger({ natsName: config.name }),
  };
}

import type { ConnectionOptions } from 'nats';

import { createLogger, type Logger } from '../utils';

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

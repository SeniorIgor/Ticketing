import type { ConnectionOptions } from 'nats';

import { consoleLogger, type Logger } from '../utils';

export type NatsConnectConfig = {
  servers: string | string[];
  name?: string;
  logger?: Logger;
  /**
   * Extra nats.js ConnectionOptions.
   * (auth, tls, reconnect, timeout, etc.)
   */
  connectionOptions?: Omit<ConnectionOptions, 'servers' | 'name'>;
};

export type NatsRuntime = {
  logger: Logger;
};

export function normalizeConfig(config: NatsConnectConfig): Required<NatsRuntime> & NatsConnectConfig {
  return {
    ...config,
    logger: config.logger ?? consoleLogger,
  };
}

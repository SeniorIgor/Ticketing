import type { ConnectionOptions } from 'nats';

import type { Logger } from './observability/logger';
import { consoleLogger } from './observability/logger';

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

export function normalizeConfig(cfg: NatsConnectConfig): Required<NatsRuntime> & NatsConnectConfig {
  return {
    ...cfg,
    logger: cfg.logger ?? consoleLogger,
  };
}

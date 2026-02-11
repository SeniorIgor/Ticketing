import type { JetStreamClient, JetStreamManager, NatsConnection } from 'nats';

import type { Logger } from '@org/core';

export interface NatsDeps {
  connection: NatsConnection;
  client: JetStreamClient;
  manager: JetStreamManager;
  logger: Logger;
  name: string;
}

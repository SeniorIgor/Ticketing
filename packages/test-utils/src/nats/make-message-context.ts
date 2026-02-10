import type { MessageContext } from '@org/nats';

export function makeMessageContextFactory(base: Partial<MessageContext>) {
  return (overrides?: Partial<MessageContext>): MessageContext =>
    ({
      subject: base.subject,
      seq: overrides?.seq ?? base.seq ?? 1,
      delivered: overrides?.delivered ?? base.delivered ?? 1,
      correlationId: overrides?.correlationId ?? base.correlationId,
    }) as MessageContext;
}

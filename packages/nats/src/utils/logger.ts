export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const logger: Logger = {
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

export function createLogger(ctx?: Record<string, unknown>): Logger {
  return {
    debug: (...args) => logger.debug(...args, ctx),
    info: (...args) => logger.info(...args, ctx),
    warn: (...args) => logger.warn(...args, ctx),
    error: (...args) => logger.error(...args, ctx),
  };
}

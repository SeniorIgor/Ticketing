/**
 * Read a required environment variable.
 * Throws if missing or empty.
 *
 * Use overloads for:
 *  - any string env: requireEnv('JWT_SECRET')
 *  - "one-of" values: requireEnvEnum('NODE_ENV', ['development','production'] as const)
 */
export function requireEnv(name: string): string {
  const raw = process.env[name];

  if (typeof raw !== 'string') {
    throw new Error(`${name} is required`);
  }

  const value = raw.trim();
  if (value.length === 0) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function requireEnvAs<T extends string>(name: string): T {
  return requireEnv(name) as T;
}

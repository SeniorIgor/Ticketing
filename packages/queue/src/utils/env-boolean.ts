export function envBoolean(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (value == null || value === '') {
    return fallback;
  }

  return value === 'true' || value === '1';
}

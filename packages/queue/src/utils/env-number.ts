export function envNumber(name: string, fallback?: number): number {
  const value = process.env[name];
  if (value == null || value === '') {
    if (fallback == null) {
      throw new Error(`${name} is required`);
    }

    return fallback;
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    throw new Error(`${name} must be a number`);
  }
  return num;
}

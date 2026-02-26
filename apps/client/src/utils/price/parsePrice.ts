export function parsePrice(value: string) {
  // Allow empty while typing
  if (value.trim() === '') {
    return { ok: false as const, value: 0 };
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    return { ok: false as const, value: 0 };
  }

  if (number < 0) {
    return { ok: false as const, value: number };
  }

  return { ok: true as const, value: number };
}

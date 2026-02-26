const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(price: number) {
  const number = Number(price);

  if (!Number.isFinite(number)) {
    return '$0.00';
  }

  return usd.format(number);
}

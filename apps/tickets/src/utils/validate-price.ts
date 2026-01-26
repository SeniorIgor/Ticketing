import type { ErrorDetail } from '@org/core';

export function validatePrice(price: unknown, options: { required: boolean }): ErrorDetail[] {
  const errors: ErrorDetail[] = [];

  if (price == null) {
    if (options.required) {
      errors.push({
        fieldName: 'price',
        message: 'Price is required',
      });
    }
    return errors;
  }

  if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
    errors.push({
      fieldName: 'price',
      message: 'Price must be >= 0',
    });
  }

  return errors;
}

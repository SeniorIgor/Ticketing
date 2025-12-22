import type { ErrorDetail } from '../errors';

import type { ValidationFailure } from './validation.types';

export function toFieldError<E extends string>(result: ValidationFailure<E>, fieldName: string): ErrorDetail {
  return {
    fieldName,
    message: result.message,
  };
}

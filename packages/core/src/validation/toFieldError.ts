import type { FieldError, ValidationResult } from './validation.types';

export function toFieldError<E extends string>(result: ValidationResult<E>): FieldError<E> {
  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    code: result.error!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    message: result.message!,
  };
}

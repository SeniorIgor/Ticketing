import { BaseError } from './base-error';
import type { ErrorDetail } from './types';

export class ValidationError extends BaseError {
  constructor(reason: string | null = null, details: Array<ErrorDetail>) {
    super(400, 'VALIDATION', 'Validation failed', reason, details);
  }
}

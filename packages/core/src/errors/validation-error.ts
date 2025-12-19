import { BaseError } from './base-error';

export class ValidationError extends BaseError {
  constructor(reason: string, details: { message: string; fieldName?: string }[]) {
    super(400, 'VALIDATION', 'Validation failed', reason, details);
  }
}

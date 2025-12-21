import { BaseError } from './base-error';

export class InternalError extends BaseError {
  constructor(reason: string | null = null, message = 'Something went wrong') {
    super(500, 'INTERNAL', message, reason);
  }
}

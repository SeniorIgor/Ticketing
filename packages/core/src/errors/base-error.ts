import type { ApiError } from './types/api-error';
import type { ErrorCode } from './types/error-codes';

export class BaseError extends Error {
  readonly statusCode: number;
  readonly apiError: ApiError;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    reason: string | null = null,
    details: ApiError['details'] = [],
  ) {
    super(message);

    this.statusCode = statusCode;
    this.apiError = {
      code,
      reason,
      message,
      details,
    };
  }
}

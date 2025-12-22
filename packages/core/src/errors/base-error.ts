import type { ApiError, ErrorCode, ErrorDetail } from './types';

export abstract class BaseError extends Error {
  readonly statusCode: number;
  readonly apiError: ApiError;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    reason: string | null = null,
    details: Array<ErrorDetail> = [],
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.apiError = {
      code,
      reason,
      message,
      details,
    };
  }
}

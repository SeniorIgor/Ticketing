import { BaseError } from './base-error';

export class BusinessRuleError extends BaseError {
  constructor(reason: string, message: string, statusCode = 409) {
    super(statusCode, 'BUSINESS_RULE', message, reason);
  }
}

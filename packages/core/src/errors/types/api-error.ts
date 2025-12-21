import type { ErrorCode } from './error-codes';
import type { ErrorDetail } from './error-detail';

export interface ApiError {
  code: ErrorCode;
  reason: string | null;
  message: string;
  details?: Array<ErrorDetail>;
}

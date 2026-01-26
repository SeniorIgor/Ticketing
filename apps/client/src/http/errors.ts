export interface ValidationErrorDetail {
  fieldName: string;
  message: string;
}

export interface BackendErrorBase {
  code: string;
  message: string;
  reason?: string;
}

export interface ValidationBackendError extends BackendErrorBase {
  code: 'VALIDATION';
  details: ValidationErrorDetail[];
}

export type BackendError = ValidationBackendError | BackendErrorBase;

export interface ErrorPayload {
  code: string;
  message: string;
  reason?: string;
  details?: unknown;
}

export class HttpError<T = unknown> extends Error {
  constructor(
    public status: number,
    public payload: T,
    public requestId?: string,
  ) {
    super(typeof payload === 'object' && payload && 'message' in payload ? String(payload.message) : 'Request failed');
    this.name = 'HttpError';
  }
}

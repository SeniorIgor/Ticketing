export type FieldError = {
  fieldName: string;
  message: string;
};

export type ApiErrorPayload = {
  code?: string;
  message?: string;
  errors?: FieldError[];
};

export type HttpError = {
  status: number;
  payload?: ApiErrorPayload;
};

/**
 * Type guard: checks if value looks like HttpError.
 */
export function isHttpError(value: unknown): value is HttpError {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.status === 'number';
}

/**
 * Extracts a user-friendly message from an HttpError or unknown error.
 * - prefers payload.message
 * - falls back to first field error
 * - falls back to native error.message
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isHttpError(error)) {
    const payload = error.payload;

    const payloadMessage = payload?.message?.trim();
    if (payloadMessage) {
      return payloadMessage;
    }

    const firstFieldError = payload?.errors?.[0]?.message?.trim();
    if (firstFieldError) {
      return firstFieldError;
    }

    // last-resort: show status in dev-ish style without exposing internals too much
    return fallback;
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    return message || fallback;
  }

  return fallback;
}

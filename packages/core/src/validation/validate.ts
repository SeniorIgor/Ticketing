import type { z } from 'zod';

import { type ErrorDetail, ValidationError } from '../errors';

function pathToFieldName(path: ReadonlyArray<PropertyKey>): string {
  const parts = path.map((segment) => {
    if (typeof segment === 'number') {
      return `[${segment}]`;
    }

    if (typeof segment === 'symbol') {
      return segment.description ? `[${segment.description}]` : '[symbol]';
    }

    return segment; // string
  });

  // Join + cleanup: "a.[0]" -> "a[0]"
  return parts.join('.').replace('.[', '[');
}

export function zodToErrorDetails(error: z.ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    message: issue.message,
    fieldName: pathToFieldName(issue.path),
  }));
}

export function validate<TOutput>(schema: z.ZodType<TOutput>, data: unknown, reason: string): TOutput {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new ValidationError(reason, zodToErrorDetails(parsed.error));
  }

  return parsed.data;
}

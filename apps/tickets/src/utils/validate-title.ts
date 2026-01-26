import type { ErrorDetail } from '@org/core';

export function validateTitle(title: unknown, options: { required: boolean }): ErrorDetail[] {
  const errors: ErrorDetail[] = [];

  if (title == null) {
    if (options.required) {
      errors.push({
        fieldName: 'title',
        message: 'Title is required (min 3 chars)',
      });
    }
    return errors;
  }

  if (typeof title !== 'string' || title.trim().length < 3) {
    errors.push({
      fieldName: 'title',
      message: 'Title must be at least 3 characters',
    });
  }

  return errors;
}

import { useState } from 'react';

import type { BackendError, ValidationBackendError } from '@/http/errors';
import type { FieldErrors } from '@/types';

export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }

  function clearAllErrors() {
    setFieldErrors({});
    setFormError(null);
  }

  function applyBackendError(error: BackendError) {
    if (error.code === 'VALIDATION' && 'details' in error) {
      const validation = error as ValidationBackendError;
      const nextFieldErrors: FieldErrors = {};

      for (const detail of validation.details) {
        nextFieldErrors[detail.fieldName] = detail.message;
      }

      setFieldErrors(nextFieldErrors);
      return;
    }

    setFormError(error.message ?? 'Something went wrong');
  }

  return {
    fieldErrors,
    formError,
    clearFieldError,
    clearAllErrors,
    applyBackendError,
  };
}

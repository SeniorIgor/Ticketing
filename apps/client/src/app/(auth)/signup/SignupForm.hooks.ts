import { useState } from 'react';

import type { ChangeEvent, FormEvent } from 'react';

import { useFormErrors, useRequest } from '@/hooks';
import { isBackendError } from '@/http';
import { signupUser } from '@/services';

export function useSignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { loading, run } = useRequest();
  const { fieldErrors, formError, clearFieldError, clearAllErrors, applyBackendError } = useFormErrors();

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    clearFieldError('email');
  }

  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    clearFieldError('password');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    clearAllErrors();

    const result = await run(() => signupUser({ email, password }));

    if (!result.ok) {
      const payload = result.error.payload;

      if (isBackendError(payload)) {
        applyBackendError(payload);
      } else {
        applyBackendError({
          code: 'UNKNOWN',
          message: 'Something went wrong',
        });
      }

      return;
    }

    window.location.replace('/');
  }

  return {
    email,
    password,
    loading,
    fieldErrors,
    formError,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
}

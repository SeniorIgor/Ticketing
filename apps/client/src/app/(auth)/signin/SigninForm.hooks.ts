import { useState } from 'react';

import type { ChangeEvent, FormEvent } from 'react';

import { useFormErrors, useRequest } from '@/hooks';
import { isBackendError } from '@/http';
import { signinUser } from '@/services/auth';

import { getNextFromLocation } from './SigninForm.utils';

export function useSigninForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { loading, run } = useRequest();
  const { fieldErrors, formError, clearFieldError, clearAllErrors, applyBackendError } = useFormErrors();

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    clearFieldError('email');
  }

  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    clearFieldError('password');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    clearAllErrors();

    const result = await run(() => signinUser({ email, password }));

    if (!result.ok) {
      const payload = result.error.payload;

      if (isBackendError(payload)) {
        applyBackendError(payload);
      } else {
        applyBackendError({
          code: 'UNKNOWN',
          message: 'Invalid email or password',
        });
      }

      return;
    }

    const next = getNextFromLocation();
    window.location.replace(next ?? '/');
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

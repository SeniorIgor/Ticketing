import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useFormErrors, useRequest } from '@/hooks';
import { isBackendError } from '@/http';
import { signinUser } from '@/services/auth/signin';

export function useSigninForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

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

    router.replace('/');
    router.refresh();
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

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { ChangeEvent, FormEvent } from 'react';

import { useNotify } from '@/components/NotificationContext/NotificationContext';
import { useFormErrors, useRequest } from '@/hooks';
import { isBackendError } from '@/http';
import { createTicket } from '@/services';
import { parsePrice } from '@/utils';

export function useCreateTicketForm() {
  const router = useRouter();
  const notify = useNotify();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(''); // keep as string for UX while typing

  const { loading, run } = useRequest();
  const { fieldErrors, formError, clearFieldError, clearAllErrors, applyBackendError } = useFormErrors();

  const parsedPrice = useMemo(() => parsePrice(price), [price]);

  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    clearFieldError('title');
  }

  function handlePriceChange(e: ChangeEvent<HTMLInputElement>) {
    setPrice(e.target.value);
    clearFieldError('price');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    clearAllErrors();

    // Lightweight client validation (backend stays source of truth)
    const trimmed = title.trim();
    if (trimmed.length < 3) {
      applyBackendError({
        code: 'VALIDATION',
        message: 'Validation error',
        details: [{ fieldName: 'title', message: 'Title must be at least 3 characters' }],
      });
      return;
    }

    if (!parsedPrice.ok) {
      applyBackendError({
        code: 'VALIDATION',
        message: 'Validation error',
        details: [{ fieldName: 'price', message: 'Price must be a valid number >= 0' }],
      });
      return;
    }

    const result = await run(() =>
      createTicket({
        title: trimmed,
        price: parsedPrice.value,
      }),
    );

    if (!result.ok) {
      // If session expired etc.
      if (result.error.status === 401) {
        notify('Please sign in to create a ticket.', 'info');
        router.replace('/signin');
        return;
      }

      const payload = result.error.payload;

      if (isBackendError(payload)) {
        // Validation errors go to fields; others to formError
        applyBackendError(payload);
        // Non-validation errors: toast too (nice UX)
        if (payload.code !== 'VALIDATION') {
          notify(payload.message ?? 'Something went wrong', 'danger');
        }
      } else {
        applyBackendError({ code: 'UNKNOWN', message: 'Something went wrong' });
        notify('Something went wrong', 'danger');
      }

      return;
    }

    notify('Ticket created!', 'success');
    router.push('/');
    router.refresh();
  }

  return {
    title,
    price,
    loading,
    fieldErrors,
    formError,
    handleTitleChange,
    handlePriceChange,
    handleSubmit,
  };
}

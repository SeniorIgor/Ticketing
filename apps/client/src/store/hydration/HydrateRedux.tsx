'use client';

import { useEffect } from 'react';

import { useAppDispatch } from '../hooks';
import { hydrateAuth } from '../slices/authSlice';

import type { HydrationPayload } from './types';

export function HydrateRedux({ payload }: { payload: HydrationPayload }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (payload.auth) {
      dispatch(hydrateAuth(payload.auth));
    }
  }, [dispatch, payload]);

  return null;
}

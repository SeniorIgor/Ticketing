'use client';

import { useRef } from 'react';

import { Provider } from 'react-redux';

import type { AppPreloadedState } from './store';
import { type AppStore, makeStore } from './store';

export function StoreProvider({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState?: AppPreloadedState;
}) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore(preloadedState);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

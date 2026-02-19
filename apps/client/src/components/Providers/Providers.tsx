import type { ReactNode } from 'react';

import { type AppPreloadedState, StoreProvider } from '@/store';

interface ProvidersProps {
  children: ReactNode;
  preloadedState?: AppPreloadedState;
}

export function Providers({ children, preloadedState }: ProvidersProps) {
  return <StoreProvider preloadedState={preloadedState}>{children}</StoreProvider>;
}

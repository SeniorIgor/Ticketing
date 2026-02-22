'use client';

import React, { createContext, useContext } from 'react';

type PublicEnv = {
  stripePublishableKey: string;
};

const PublicEnvContext = createContext<PublicEnv | null>(null);

export function PublicEnvProvider({
  children,
  stripePublishableKey,
}: React.PropsWithChildren<{ stripePublishableKey: string }>) {
  return <PublicEnvContext.Provider value={{ stripePublishableKey }}>{children}</PublicEnvContext.Provider>;
}

export function usePublicEnv() {
  const ctx = useContext(PublicEnvContext);
  if (!ctx) {
    throw new Error('usePublicEnv must be used inside <PublicEnvProvider>');
  }
  return ctx;
}

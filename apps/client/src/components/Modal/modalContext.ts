'use client';

import { createContext, useContext } from 'react';

export type ModalApi = {
  open: (content: React.ReactNode) => void;
  close: () => void;
  isOpen: boolean;
};

const ModalContext = createContext<ModalApi | null>(null);

export function useModal(): ModalApi {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModal must be used within <ModalProvider>');
  }
  return ctx;
}

export { ModalContext };

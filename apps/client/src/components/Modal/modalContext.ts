'use client';

import { createContext, useContext } from 'react';

import type { ModalFrameProps } from './ModalFrame/ModalFrame.types';

export type ModalOpenOptions = Pick<ModalFrameProps, 'title' | 'size' | 'closeOnBackdrop' | 'closeOnEsc' | 'isBusy'>;

export type ModalApi = {
  open: (content: React.ReactNode, options?: ModalOpenOptions) => void;
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

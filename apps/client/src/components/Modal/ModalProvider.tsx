'use client';

import { useCallback, useMemo, useState } from 'react';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { ModalFrame } from './ModalFrame/ModalFrame';
import type { ModalOpenOptions } from './modalContext';
import { ModalContext } from './modalContext';

type ModalProviderProps = {
  children: ReactNode;
};

export function ModalProvider({ children }: ModalProviderProps) {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [frameOptions, setFrameOptions] = useState<ModalOpenOptions | null>(null);

  const close = useCallback(() => {
    setContent(null);
    setFrameOptions(null);
  }, []);
  const open = useCallback((node: ReactNode, options?: ModalOpenOptions) => {
    setContent(node);
    setFrameOptions(options ?? null);
  }, []);

  const api = useMemo(
    () => ({
      open,
      close,
      isOpen: !!content,
    }),
    [open, close, content],
  );

  return (
    <ModalContext.Provider value={api}>
      {children}

      {/* Global modal host */}
      {content
        ? createPortal(
            <ModalFrame
              onClose={close}
              title={frameOptions?.title}
              size={frameOptions?.size}
              closeOnBackdrop={frameOptions?.closeOnBackdrop}
              closeOnEsc={frameOptions?.closeOnEsc}
              isBusy={frameOptions?.isBusy}
            >
              {content}
            </ModalFrame>,
            document.body,
          )
        : null}
    </ModalContext.Provider>
  );
}

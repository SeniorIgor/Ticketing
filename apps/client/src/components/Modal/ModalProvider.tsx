'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { ModalContext } from './modalContext';
import { ModalFrame } from './ModalFrame/ModalFrame';

type ModalProviderProps = {
  children: ReactNode;
};

export function ModalProvider({ children }: ModalProviderProps) {
  const [content, setContent] = useState<ReactNode | null>(null);

  const close = useCallback(() => setContent(null), []);
  const open = useCallback((node: ReactNode) => setContent(node), []);

  // Close on ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
      }
    }

    if (content) {
      document.addEventListener('keydown', onKeyDown);
      // optional: lock scroll
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = prevOverflow;
      };
    }

    return undefined;
  }, [content, close]);

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
      {content ? createPortal(<ModalFrame onClose={close}>{content}</ModalFrame>, document.body) : null}
    </ModalContext.Provider>
  );
}

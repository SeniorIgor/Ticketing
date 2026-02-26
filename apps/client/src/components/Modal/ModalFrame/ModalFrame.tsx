'use client';

import { useEffect, useRef } from 'react';

import clsx from 'clsx';

import type { ModalSize } from './ModalFrame.types';
import { sizeClass } from './ModalFrame.utils';

import styles from './ModalFrame.module.scss';

interface ModalFrameProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  isBusy?: boolean;
}

export function ModalFrame({
  children,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  isBusy = false,
}: ModalFrameProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ESC handling
  useEffect(() => {
    if (!closeOnEsc) {
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') {
        return;
      }
      if (isBusy) {
        return;
      }
      onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeOnEsc, isBusy, onClose]);

  return (
    <div
      ref={overlayRef}
      className={clsx(styles.overlay, isBusy && styles.busy)}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Modal'}
      onMouseDown={(e) => {
        if (!closeOnBackdrop || isBusy) {
          return;
        }
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={clsx('card border-0 shadow-lg rounded-4', styles.card, sizeClass(size))}>
        {(title || !isBusy) && (
          <div
            className={clsx('card-header d-flex align-items-center justify-content-between py-3 px-4', styles.header)}
          >
            <div className={styles.title}>{title ?? ''}</div>

            <button
              type="button"
              className={clsx('btn btn-sm btn-outline-secondary', styles.closeBtn)}
              onClick={() => {
                if (!isBusy) {
                  onClose();
                }
              }}
              aria-label="Close"
              disabled={isBusy}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

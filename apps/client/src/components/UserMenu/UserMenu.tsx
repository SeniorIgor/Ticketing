'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import clsx from 'clsx';

import { ROUTES } from '@/constants';
import { selectIsAuthenticated, useAppSelector } from '@/store';

import SignOutButton from '../SignOutButton/SignOutButton';

import { NavList } from './components/NavList/NavList';
import { Section } from './components/Section/Section';
import { authedNavItems, commonNavItems, guestNavItems } from './UserMenu.constants';

import styles from './UserMenu.module.scss';

type UserMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function UserMenu({ isOpen, onClose }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthed = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  function closeAndNavigate(href: string) {
    onClose();
    router.push(href);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <aside className={styles.drawer} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <div className={styles.title}>Menu</div>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className={styles.subtitle}>
            {isAuthed ? (
              <span className={clsx('badge rounded-pill', styles.authedPill)}>
                <i className="bi bi-shield-check me-1" />
                Signed in
              </span>
            ) : (
              <span className={clsx('badge rounded-pill', styles.guestPill)}>
                <i className="bi bi-person me-1" />
                Guest
              </span>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <Section title="Navigation">
            <NavList items={commonNavItems} pathname={pathname} onSelect={closeAndNavigate} />
          </Section>

          {isAuthed ? (
            <Section title="Account">
              <NavList items={authedNavItems} pathname={pathname} onSelect={closeAndNavigate} />
            </Section>
          ) : (
            <Section title="Account">
              <NavList items={guestNavItems} pathname={pathname} onSelect={closeAndNavigate} />
            </Section>
          )}

          <div className={styles.footer}>
            {isAuthed ? (
              <SignOutButton className="btn btn-outline-danger w-100" />
            ) : (
              <div className={styles.footerHint}>
                <i className="bi bi-info-circle me-2" />
                Sign in to manage orders, payments, and your tickets.
              </div>
            )}

            <div className={styles.footerLinks}>
              <Link className={styles.mutedLink} href={ROUTES.tickets.root} onClick={onClose}>
                Browse tickets
              </Link>
              <span className={styles.dot} aria-hidden="true">
                •
              </span>
              <Link className={styles.mutedLink} href={ROUTES.home} onClick={onClose}>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

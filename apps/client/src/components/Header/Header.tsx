'use client';

import { useState } from 'react';
import Link from 'next/link';

import { ROUTES } from '@/constants';
import { selectIsAuthenticated, useAppSelector } from '@/store';

import { UserMenu } from '../UserMenu/UserMenu';

export function Header() {
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="border-bottom bg-white">
        <div className="container py-3 d-flex align-items-center justify-content-between gap-3">
          <Link href={ROUTES.home} className="navbar-brand d-flex align-items-center gap-2">
            <img src="/logo.png" alt="Ticketing" width={32} height={32} />
            <span className="fw-bold">Ticketing</span>
          </Link>

          <div className="d-flex gap-2 align-items-center">
            {!isAuthed && (
              <>
                <Link href={ROUTES.signIn} className="btn btn-outline-primary">
                  Sign in
                </Link>
                <Link href={ROUTES.signUp} className="btn btn-primary">
                  Sign up
                </Link>
              </>
            )}

            <button
              type="button"
              className="btn btn-outline-secondary"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <i className="bi bi-list" />
            </button>
          </div>
        </div>
      </header>

      <UserMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

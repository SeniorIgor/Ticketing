'use client';

import Link from 'next/link';

import { ROUTES } from '@/constants';
import { selectIsAuthenticated, useAppSelector } from '@/store';

import SignOutButton from './SignOutButton/SignOutButton';

export default function Header() {
  const isAuthed = useAppSelector(selectIsAuthenticated);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container">
        <Link href={ROUTES.home} className="navbar-brand d-flex align-items-center gap-2">
          <img src="/logo.png" alt="Ticketing" width={32} height={32} />
          <span className="fw-bold">Ticketing</span>
        </Link>

        <div className="d-flex gap-2">
          {!isAuthed ? (
            <>
              <Link href={ROUTES.signUp} className="btn btn-outline-primary">
                Sign up
              </Link>
              <Link href={ROUTES.signIn} className="btn btn-primary">
                Sign in
              </Link>
            </>
          ) : (
            <SignOutButton />
          )}
        </div>
      </div>
    </nav>
  );
}

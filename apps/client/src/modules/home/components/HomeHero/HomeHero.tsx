'use client';

import Link from 'next/link';

import { selectIsAuthenticated, useAppSelector } from '@/store';

export function HomeHero() {
  const isAuthed = useAppSelector(selectIsAuthenticated);

  return (
    <div className="p-4 p-md-5 mb-4 rounded-3 bg-body-tertiary border">
      <div className="container-fluid py-2">
        <h1 className="display-6 fw-semibold mb-2">Buy & sell tickets</h1>
        <p className="col-lg-8 fs-5 text-muted mb-4">
          Browse the latest listings. Secure checkout and real-time availability.
        </p>

        <div className="d-flex flex-wrap gap-2">
          {isAuthed ? (
            <>
              <Link href="/tickets/new" className="btn btn-success btn-lg">
                Sell a ticket
              </Link>
              <Link href="/tickets" className="btn btn-outline-primary btn-lg">
                Browse all
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Create account
              </Link>
              <Link href="/signin" className="btn btn-outline-primary btn-lg">
                Sign in
              </Link>
              <Link href="/tickets" className="btn btn-link btn-lg">
                Continue as guest
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

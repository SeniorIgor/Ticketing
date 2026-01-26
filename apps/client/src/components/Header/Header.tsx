import Link from 'next/link';

import { getCurrentUserServer } from '@/services';

import SignOutButton from './SignOutButton/SignOutButton';

export default async function Header() {
  const result = await getCurrentUserServer();
  const isAuthenticated = result.ok ? true : false;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
          <img src="/logo.png" alt="Ticketing" width={32} height={32} />
          <span className="fw-bold">Ticketing</span>
        </Link>

        <div className="d-flex gap-2">
          {!isAuthenticated ? (
            <>
              <Link href="/signup" className="btn btn-outline-primary">
                Sign up
              </Link>
              <Link href="/signin" className="btn btn-primary">
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

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { signoutUser } from '@/services';

import { useNotify } from '../NotificationContext/NotificationContext';

interface HeaderProps {
  isAuthenticated: boolean;
}

export default function Header({ isAuthenticated }: HeaderProps) {
  const router = useRouter();
  const notify = useNotify();

  async function handleSignOut() {
    try {
      await signoutUser();
      router.replace('/');
      router.refresh();
    } catch {
      notify('Failed to sign out. Please try again.', 'danger');
    }
  }

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
                Sign Up
              </Link>
              <Link href="/signin" className="btn btn-primary">
                Sign In
              </Link>
            </>
          ) : (
            <button type="button" className="btn btn-outline-danger" onClick={handleSignOut}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

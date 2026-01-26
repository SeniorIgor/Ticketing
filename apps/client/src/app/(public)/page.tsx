import Link from 'next/link';

import { getCurrentUserServer } from '@/services';

export default async function HomePage() {
  const result = await getCurrentUserServer();
  const currentUser = result.ok ? result.data.currentUser : null;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="mb-4">
            Welcome to <span className="fw-bold">Ticketing</span>
          </h1>

          {currentUser ? (
            <>
              <p className="lead mb-2">You’re signed in — you can now manage your tickets and bookings.</p>
              <p className="text-muted mb-0">
                Signed in as <strong>{currentUser.email}</strong>
              </p>
            </>
          ) : (
            <>
              <p className="lead mb-3">Please sign up or sign in to start using Ticketing.</p>
              <div className="d-flex justify-content-center gap-2">
                <Link href="/signup" className="btn btn-primary">
                  Create account
                </Link>
                <Link href="/signin" className="btn btn-outline-primary">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

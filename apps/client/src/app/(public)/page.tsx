import { getCurrentUser } from '@/services/auth/getCurrentUser';
// import { isAuthenticated } from '@/utils';

export default async function HomePage() {
  // const authenticated = await isAuthenticated();

  const result = await getCurrentUser();

  const currentUser = result.ok ? result.data.currentUser : null;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="mb-4">
            Welcome to <span className="fw-bold">Ticketing</span>
          </h1>

          {/* {authenticated ? (
            <p className="lead">You are signed in. You can now manage your tickets and bookings.</p>
          ) : (
            <p className="lead">Please sign up or sign in to start using Ticketing.</p>
          )} */}

          {currentUser ? (
            <div className="alert alert-success">
              Signed in as <strong>{currentUser.email}</strong>
            </div>
          ) : (
            <div className="alert alert-secondary">You are not signed in.</div>
          )}
        </div>
      </div>
    </div>
  );
}

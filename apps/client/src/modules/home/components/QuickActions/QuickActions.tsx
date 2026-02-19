import Link from 'next/link';

type QuickActionsProps = {
  isAuthed: boolean;
};

export function QuickActions({ isAuthed }: QuickActionsProps) {
  if (!isAuthed) {
    return null;
  }

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <div className="fw-semibold mb-1">Sell a ticket</div>
            <div className="text-muted small mb-3">Create a new listing in seconds.</div>
            <Link className="btn btn-success w-100" href="/tickets/new">
              Create
            </Link>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <div className="fw-semibold mb-1">My tickets</div>
            <div className="text-muted small mb-3">Manage your listings.</div>
            <Link className="btn btn-outline-primary w-100" href="/tickets/mine">
              Open
            </Link>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <div className="fw-semibold mb-1">My orders</div>
            <div className="text-muted small mb-3">Track purchases & reservations.</div>
            <Link className="btn btn-outline-primary w-100" href="/orders">
              Open
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

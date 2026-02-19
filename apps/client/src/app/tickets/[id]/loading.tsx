export default function TicketDetailsLoading() {
  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-5">
          {/* Title + Status */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="w-75">
              <div className="placeholder-glow">
                <div className="placeholder col-9 mb-2 rounded" style={{ height: 28 }} />
                <div className="placeholder col-4 rounded" style={{ height: 14 }} />
              </div>
            </div>

            <div className="placeholder-glow">
              <div className="placeholder rounded-pill" style={{ width: 90, height: 28 }} />
            </div>
          </div>

          <hr className="opacity-25 my-4" />

          {/* Price section */}
          <div className="row align-items-end g-4">
            <div className="col-md-6">
              <div className="placeholder-glow">
                <div className="placeholder col-4 mb-2 rounded" style={{ height: 14 }} />
                <div className="placeholder col-6 rounded" style={{ height: 42 }} />
              </div>
            </div>

            <div className="col-md-6">
              <div className="placeholder-glow">
                <div className="placeholder rounded w-100" style={{ height: 44 }} />
              </div>
            </div>
          </div>

          <hr className="opacity-25 my-4" />

          {/* Bottom buttons */}
          <div className="d-flex gap-3">
            <div className="placeholder-glow">
              <div className="placeholder rounded" style={{ width: 140, height: 38 }} />
            </div>
            <div className="placeholder-glow">
              <div className="placeholder rounded" style={{ width: 140, height: 38 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

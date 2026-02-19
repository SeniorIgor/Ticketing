export function TicketsSkeleton() {
  const items = Array.from({ length: 6 });

  return (
    <div className="row g-4">
      {items.map((_, idx) => (
        <div key={idx} className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="w-75">
                  <div className="placeholder-glow">
                    <div className="placeholder col-10 mb-2 rounded" style={{ height: 18 }} />
                    <div className="placeholder col-5 rounded" style={{ height: 12 }} />
                  </div>
                </div>

                <div className="placeholder-glow">
                  <div className="placeholder rounded-pill" style={{ width: 70, height: 24 }} />
                </div>
              </div>

              <hr className="opacity-25 my-3" />

              {/* Price */}
              <div className="placeholder-glow mb-4">
                <div className="placeholder col-4 mb-2 rounded" style={{ height: 12 }} />
                <div className="placeholder col-6 rounded" style={{ height: 32 }} />
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-between align-items-center">
                <div className="placeholder-glow w-50">
                  <div className="placeholder col-8 rounded" style={{ height: 14 }} />
                </div>

                <div className="placeholder-glow">
                  <div className="placeholder rounded-circle" style={{ width: 20, height: 20 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

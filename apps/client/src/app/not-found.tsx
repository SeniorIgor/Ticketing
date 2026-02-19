import Link from 'next/link';

import { ROUTES } from '@/constants';

export default function NotFoundPage() {
  return (
    <div className="container py-5">
      <div className="row align-items-center g-4">
        <div className="col-12 col-lg-6">
          <div className="badge text-bg-light border mb-3">404</div>
          <h1 className="display-6 fw-semibold mb-2">Page not found</h1>
          <p className="text-muted mb-4">The page you’re looking for doesn’t exist (or it has been moved).</p>

          <div className="d-flex gap-2 flex-wrap">
            <Link href={ROUTES.home} className="btn btn-primary">
              Go home
            </Link>
            <Link href={ROUTES.tickets.root} className="btn btn-outline-secondary">
              Browse tickets
            </Link>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-0">
              {/* Simple “picturesque” SVG illustration (no extra deps) */}
              <svg viewBox="0 0 900 420" width="100%" height="100%" role="img" aria-label="Not found illustration">
                <defs>
                  <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f8f9fa" />
                    <stop offset="100%" stopColor="#e9ecef" />
                  </linearGradient>
                  <linearGradient id="accent" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                <rect width="900" height="420" fill="url(#sky)" />

                {/* Hills */}
                <path
                  d="M0 290 C180 250, 260 320, 420 290 C560 265, 640 310, 900 270 L900 420 L0 420 Z"
                  fill="#dee2e6"
                />
                <path
                  d="M0 320 C190 290, 310 360, 470 330 C620 305, 720 350, 900 320 L900 420 L0 420 Z"
                  fill="#ced4da"
                />

                {/* Ticket card */}
                <g transform="translate(250,120)">
                  <rect x="0" y="0" rx="18" ry="18" width="400" height="180" fill="#ffffff" stroke="#dee2e6" />
                  <rect x="0" y="0" rx="18" ry="18" width="400" height="10" fill="url(#accent)" />
                  <circle cx="55" cy="70" r="18" fill="#e9ecef" />
                  <rect x="85" y="56" width="240" height="16" rx="8" fill="#e9ecef" />
                  <rect x="85" y="82" width="160" height="12" rx="6" fill="#f1f3f5" />
                  <rect x="55" y="120" width="140" height="26" rx="10" fill="#e9ecef" />
                  <rect x="215" y="120" width="130" height="26" rx="10" fill="#f1f3f5" />
                  <text x="320" y="165" textAnchor="middle" fontSize="44" fontWeight="700" fill="#adb5bd">
                    404
                  </text>
                </g>

                {/* Clouds */}
                <g fill="#ffffff" opacity="0.7">
                  <ellipse cx="120" cy="90" rx="55" ry="28" />
                  <ellipse cx="160" cy="80" rx="42" ry="24" />
                  <ellipse cx="190" cy="92" rx="52" ry="26" />

                  <ellipse cx="720" cy="85" rx="58" ry="30" />
                  <ellipse cx="760" cy="74" rx="40" ry="22" />
                  <ellipse cx="790" cy="88" rx="50" ry="26" />
                </g>
              </svg>
            </div>
          </div>

          <div className="text-muted small mt-2">Tip: use the navigation or go back to the tickets list.</div>
        </div>
      </div>
    </div>
  );
}

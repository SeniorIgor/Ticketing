import Link from 'next/link';

import clsx from 'clsx';

import { ROUTES } from '@/constants';

import styles from './NotFoundScreen.module.scss';

type Action = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
};

type Props = {
  badge?: string;
  title: string;
  message: string;
  tip?: string;
  primary?: Action;
  secondary?: Action | null;
};

function btnClass(variant: Action['variant']) {
  return variant === 'secondary' ? 'btn btn-outline-secondary' : 'btn btn-primary';
}

export function NotFoundScreen({
  badge = '404',
  title,
  message,
  tip = 'Tip: use the navigation or go back to the previous page.',
  primary = { href: ROUTES.home, label: 'Go home', variant: 'primary' },
  secondary = { href: ROUTES.tickets.root, label: 'Browse tickets', variant: 'secondary' },
}: Props) {
  return (
    <div className={clsx('container py-5', styles.wrapper)}>
      <div className="row align-items-center g-4">
        <div className="col-12 col-lg-6">
          <div className={clsx('badge text-bg-light border mb-3', styles.badge)}>{badge}</div>
          <h1 className={clsx('display-6 fw-semibold mb-2', styles.title)}>{title}</h1>
          <p className="text-muted mb-4">{message}</p>

          <div className="d-flex gap-2 flex-wrap">
            <Link href={primary.href} className={btnClass(primary.variant)}>
              {primary.label}
            </Link>

            {secondary ? (
              <Link href={secondary.href} className={btnClass(secondary.variant)}>
                {secondary.label}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className={clsx('card border-0 shadow-sm', styles.card)}>
            <div className={styles.illustrationFrame}>
              <div className={styles.topBar} aria-hidden="true" />

              {/* “Picturesque” SVG illustration (no deps) */}
              <svg className={styles.svg} viewBox="0 0 900 420" role="img" aria-label="Not found illustration">
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

                {/* Card */}
                <g transform="translate(250,120)">
                  <rect x="0" y="0" rx="18" ry="18" width="400" height="180" fill="#ffffff" stroke="#dee2e6" />
                  <rect x="0" y="0" rx="18" ry="18" width="400" height="10" fill="url(#accent)" />
                  <circle cx="55" cy="70" r="18" fill="#e9ecef" />
                  <rect x="85" y="56" width="240" height="16" rx="8" fill="#e9ecef" />
                  <rect x="85" y="82" width="160" height="12" rx="6" fill="#f1f3f5" />
                  <rect x="55" y="120" width="140" height="26" rx="10" fill="#e9ecef" />
                  <rect x="215" y="120" width="130" height="26" rx="10" fill="#f1f3f5" />
                  <text x="320" y="165" textAnchor="middle" fontSize="44" fontWeight="700" fill="#adb5bd">
                    {badge}
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

          <div className={clsx('text-muted small mt-2', styles.tipText)}>{tip}</div>
        </div>
      </div>
    </div>
  );
}

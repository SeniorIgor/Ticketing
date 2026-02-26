'use client';

import Link from 'next/link';

import { ROUTES } from '@/constants';

type ErrorScreenProps = {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showHomeButton?: boolean;
};

export function ErrorScreen({
  title = 'Something went wrong',
  message = 'Please try again.',
  showRetry = true,
  onRetry,
  showHomeButton = true,
}: ErrorScreenProps) {
  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center p-5">
          {/* Icon */}
          <div className="mb-3 text-danger fs-1">
            <i className="bi bi-exclamation-triangle-fill" />
          </div>

          {/* Title */}
          <h2 className="h4 fw-semibold mb-2">{title}</h2>

          {/* Message */}
          <p className="text-muted mb-4">{message}</p>

          {/* Actions */}
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {showRetry && onRetry && (
              <button className="btn btn-danger" onClick={onRetry}>
                Retry
              </button>
            )}

            {showHomeButton && (
              <Link href={ROUTES.home} className="btn btn-outline-secondary">
                Go to home
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

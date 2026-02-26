'use client';

import clsx from 'clsx';

type PaymentResultVariant = 'success' | 'warning' | 'danger';

type PaymentResultProps = {
  variant: PaymentResultVariant;
  title: string;
  description?: string;
  requestId?: string;
  actions?: React.ReactNode;
};

function iconFor(variant: PaymentResultVariant) {
  switch (variant) {
    case 'success':
      return 'bi-check-circle-fill';
    case 'warning':
      return 'bi-exclamation-triangle-fill';
    case 'danger':
      return 'bi-x-circle-fill';
  }
}

function toneClasses(variant: PaymentResultVariant) {
  switch (variant) {
    case 'success':
      return { bg: 'bg-success-subtle', text: 'text-success' };
    case 'warning':
      return { bg: 'bg-warning-subtle', text: 'text-warning' };
    case 'danger':
      return { bg: 'bg-danger-subtle', text: 'text-danger' };
  }
}

export function PaymentResult({ variant, title, description, requestId, actions }: PaymentResultProps) {
  const tone = toneClasses(variant);

  return (
    <div className="card-body p-4">
      <div className="d-flex gap-3">
        <div
          className={clsx('d-flex align-items-center justify-content-center rounded-3', tone.bg)}
          style={{ width: 44, height: 44 }}
        >
          <i className={clsx('bi', iconFor(variant), tone.text)} style={{ fontSize: 22 }} />
        </div>

        <div className="flex-grow-1">
          <div className="fw-semibold">{title}</div>
          {description && <div className="text-muted small mt-1">{description}</div>}

          {requestId && (
            <div className="text-muted small mt-2">
              Request ID: <code className="ms-1">{requestId}</code>
            </div>
          )}
        </div>
      </div>

      {actions && <div className="mt-3 d-flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

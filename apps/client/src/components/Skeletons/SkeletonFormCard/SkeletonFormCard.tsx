import clsx from 'clsx';

import s from '../Skeletons.module.scss';

type Props = {
  maxWidth?: number;
  titleWidth?: string; // e.g. '45%'
  lines?: number; // small text lines under title
  fields?: number; // number of input rows
  showPrimaryButton?: boolean;
};

export function FormCardSkeleton({
  maxWidth = 720,
  titleWidth = '45%',
  lines = 2,
  fields = 2,
  showPrimaryButton = true,
}: Props) {
  return (
    <div className="container py-4" style={{ maxWidth }}>
      <div className={clsx('card border-0', s.card)}>
        <div className={s.topBar} aria-hidden="true" />
        <div className="card-body p-5">
          {/* Title */}
          <div className={clsx(s.block, s.rounded, s.h28, 'mb-3')} style={{ width: titleWidth }} />

          {/* Subtitle lines */}
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className={clsx(s.block, s.rounded, s.h14, 'mb-2')} style={{ width: `${85 - i * 10}%` }} />
          ))}

          <div className="mb-4" />

          {/* Fields */}
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className={clsx(s.block, s.rounded, s.h44, 'mb-3')} style={{ width: '100%' }} />
          ))}

          {/* Button */}
          {showPrimaryButton ? <div className={clsx(s.block, s.rounded, s.h44)} style={{ width: '45%' }} /> : null}
        </div>
      </div>
    </div>
  );
}

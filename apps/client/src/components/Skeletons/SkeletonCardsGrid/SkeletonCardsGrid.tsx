import clsx from 'clsx';

import s from '../Skeletons.module.scss';

type SkeletonCardsGridProps = { count?: number };

export function SkeletonCardsGrid({ count = 6 }: SkeletonCardsGridProps) {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="col-12 col-md-6 col-lg-4">
          <div className={clsx('card h-100 border-0', s.card)}>
            <div className={s.topBar} aria-hidden="true" />
            <div className="card-body p-4">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="w-75">
                  <div className={clsx(s.block, s.rounded, s.h18, 'mb-2')} style={{ width: '85%' }} />
                  <div className={clsx(s.block, s.rounded, s.h12)} style={{ width: '40%' }} />
                </div>

                <div className={clsx(s.block, s.roundedPill, s.h28, s.w70)} />
              </div>

              <hr className="opacity-25 my-3" />

              {/* Price */}
              <div className="mb-4">
                <div className={clsx(s.block, s.rounded, s.h12, 'mb-2')} style={{ width: '35%' }} />
                <div className={clsx(s.block, s.rounded, s.h32)} style={{ width: '55%' }} />
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-between align-items-center">
                <div className={clsx(s.block, s.rounded, s.h14)} style={{ width: '45%' }} />
                <div className={clsx(s.block, s.roundedCircle, s.size20)} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

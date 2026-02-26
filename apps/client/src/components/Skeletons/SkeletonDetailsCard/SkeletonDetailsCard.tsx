import clsx from 'clsx';

import s from '../Skeletons.module.scss';

export function SkeletonDetailsCard() {
  return (
    <div className={clsx('card border-0', s.card)}>
      <div className={s.topBar} aria-hidden="true" />
      <div className="card-body p-5">
        {/* Title + Status */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div style={{ width: '70%' }}>
            <div className={clsx(s.block, s.rounded, s.h28, 'mb-2')} style={{ width: '85%' }} />
            <div className={clsx(s.block, s.rounded, s.h14)} style={{ width: '40%' }} />
          </div>

          <div className={clsx(s.block, s.roundedPill, s.h28, s.w90)} />
        </div>

        <hr className="opacity-25 my-4" />

        {/* Price section */}
        <div className="row align-items-end g-4">
          <div className="col-md-7">
            <div className={clsx(s.block, s.rounded, s.h14, 'mb-2')} style={{ width: '35%' }} />
            <div className={clsx(s.block, s.rounded, s.h42)} style={{ width: '55%' }} />
          </div>

          <div className="col-md-5">
            <div className={clsx(s.block, s.rounded, s.h14, 'mb-2')} style={{ width: '35%' }} />
            <div className={clsx(s.block, s.rounded, s.h44)} style={{ width: '100%' }} />
          </div>
        </div>

        <hr className="opacity-25 my-4" />

        {/* Bottom buttons */}
        <div className="d-flex gap-3 flex-wrap">
          <div className={clsx(s.block, s.rounded, s.h44, s.w140)} />
          <div className={clsx(s.block, s.rounded, s.h44, s.w140)} />
        </div>
      </div>
    </div>
  );
}

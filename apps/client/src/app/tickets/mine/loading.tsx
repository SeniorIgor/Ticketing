import { SkeletonCardsGrid } from '@/components';

export default function MyTicketsLoading() {
  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="mb-1">My tickets</h1>
          <p className="text-muted mb-0">Loading your tickets…</p>
        </div>
      </div>

      <hr className="my-4" />

      <SkeletonCardsGrid count={6} />
    </div>
  );
}

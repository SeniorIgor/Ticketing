import { SkeletonDetailsCard } from '@/components';

export default function OrderDetailsLoading() {
  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      <SkeletonDetailsCard />
    </div>
  );
}

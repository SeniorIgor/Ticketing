import { FormCardSkeleton } from '@/components';

export default function NewTicketLoading() {
  return <FormCardSkeleton maxWidth={720} titleWidth="55%" lines={2} fields={2} showPrimaryButton />;
}

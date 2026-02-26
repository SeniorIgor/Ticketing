import { NotFoundScreen } from '@/components';
import { ROUTES } from '@/constants';

export default function OrderNotFound() {
  return (
    <NotFoundScreen
      title="Order not found"
      message="It may have been removed, expired, or the link is incorrect."
      primary={{ href: ROUTES.orders.root, label: 'Back to orders', variant: 'primary' }}
      secondary={{ href: ROUTES.tickets.root, label: 'Browse tickets', variant: 'secondary' }}
    />
  );
}

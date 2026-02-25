import { NotFoundScreen } from '@/components';
import { ROUTES } from '@/constants';

export default function PaymentNotFound() {
  return (
    <NotFoundScreen
      title="Payment not found"
      message="This receipt doesn’t exist (or you don’t have access to it)."
      primary={{ href: ROUTES.payments.root, label: 'Back to payments', variant: 'primary' }}
      secondary={{ href: ROUTES.orders.root, label: 'Back to orders', variant: 'secondary' }}
    />
  );
}

import { NotFoundScreen } from '@/components';
import { ROUTES } from '@/constants';

export default function TicketNotFound() {
  return (
    <NotFoundScreen
      title="Ticket not found"
      message="It may have been removed or the link is incorrect."
      primary={{ href: ROUTES.tickets.root, label: 'Back to tickets', variant: 'primary' }}
      secondary={{ href: ROUTES.home, label: 'Go home', variant: 'secondary' }}
    />
  );
}

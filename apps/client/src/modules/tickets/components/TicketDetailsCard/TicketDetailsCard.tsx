import Link from 'next/link';

import { ROUTES } from '@/constants';
import { BuyTicketButton } from '@/modules/orders/components';
import type { TicketDto } from '@/services';
import { formatPrice } from '@/utils';

import { TicketCardStatus } from '../TicketCardStatus/TicketCardStatus';

type TicketDetailsCardProps = {
  ticket: TicketDto;
  isAuthed: boolean;
};

export function TicketDetailsCard({ ticket, isAuthed }: TicketDetailsCardProps) {
  const isAvailable = ticket.status === 'available';

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div className="flex-grow-1">
            <h1 className="h3 mb-1">{ticket.title}</h1>
            <div className="text-muted small">Ticket ID #{ticket.id.slice(-6)}</div>
          </div>

          <TicketCardStatus status={ticket.status} />
        </div>

        <hr className="my-4" />

        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6">
            <div className="text-muted small mb-1">Price</div>
            <div className="display-6 fw-bold text-primary">{formatPrice(ticket.price)}</div>
          </div>

          <div className="col-12 col-md-6">
            {!isAvailable ? (
              <button className="btn btn-secondary w-100" disabled>
                {ticket.status === 'reserved'
                  ? 'Already reserved'
                  : ticket.status === 'sold'
                    ? 'Already sold'
                    : 'Unavailable'}
              </button>
            ) : !isAuthed ? (
              <Link href={ROUTES.signIn} className="btn btn-primary w-100">
                Sign in to purchase
              </Link>
            ) : (
              <BuyTicketButton ticketId={ticket.id} />
            )}
          </div>
        </div>

        <hr className="my-4" />

        <div className="d-flex gap-2 flex-wrap">
          <Link href={ROUTES.tickets.root} className="btn btn-outline-secondary">
            ← Back to tickets
          </Link>

          {isAuthed && (
            <Link href={ROUTES.tickets.new} className="btn btn-outline-success">
              Sell a ticket
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

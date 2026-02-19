import Link from 'next/link';

import clsx from 'clsx';

import { ROUTES } from '@/constants';
import type { TicketDto } from '@/services';
import { formatPrice } from '@/utils';

import { TicketCardStatus } from '../TicketCardStatus/TicketCardStatus';

import styles from './TicketCard.module.scss';

type TicketCardProps = TicketDto;

export function TicketCard({ id, price, status, title }: TicketCardProps) {
  const available = status === 'available';

  const content = (
    <div
      className={clsx('card h-100 border-0', styles.card, !available && styles.locked, !available && styles.lockedCard)}
    >
      <div className="card-body d-flex flex-column p-4">
        {/* Header */}
        <div className={clsx('d-flex justify-content-between align-items-start gap-3', styles.header)}>
          <div className="flex-grow-1">
            <h5 className={clsx('card-title mb-1 text-truncate', styles.title)}>{title}</h5>
            <div className={clsx('text-muted', styles.ticketId)}>Ticket ID #{id.slice(-6)}</div>
          </div>

          <TicketCardStatus status={status} />
        </div>

        <hr className={clsx('my-3', styles.divider)} />

        {/* Price */}
        <div className="mb-3">
          <div className={styles.priceLabel}>Price</div>
          <div className={clsx('text-primary', styles.price)}>{formatPrice(price)}</div>
        </div>

        {/* Footer */}
        <div className={clsx('mt-auto', styles.metaRow)}>
          <div className={clsx('small', available ? 'text-muted' : 'text-secondary')}>
            {available ? 'View details' : 'Unavailable'}
          </div>

          <div className={styles.chevron} aria-hidden="true">
            <i className="bi bi-chevron-right" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!available) {
    return content;
  }

  return (
    <Link href={ROUTES.tickets.details(id)} className={styles.cardLink} aria-label={`View ticket ${title}`}>
      {content}
    </Link>
  );
}

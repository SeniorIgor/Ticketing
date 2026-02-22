'use client';

import Link from 'next/link';

import { ROUTES } from '@/constants';
import { selectIsAuthenticated, useAppSelector } from '@/store';

export function TicketsCreateButton() {
  const isAuthed = useAppSelector(selectIsAuthenticated);

  if (!isAuthed) {
    return null;
  }

  return (
    <Link href={ROUTES.tickets.new} className="btn btn-success">
      Sell a ticket
    </Link>
  );
}

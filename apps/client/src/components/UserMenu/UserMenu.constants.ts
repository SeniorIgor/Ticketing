import { ROUTES } from '@/constants';

import type { NavItem } from './UserMenu.types';

export const commonNavItems: NavItem[] = [
  { label: 'Home', href: ROUTES.home, icon: 'bi-house' },
  { label: 'Tickets', href: ROUTES.tickets.root, icon: 'bi-ticket-perforated' },
];

export const authedNavItems: NavItem[] = [
  { label: 'My orders', href: ROUTES.orders.root, icon: 'bi-receipt' },
  { label: 'Payments', href: ROUTES.payments.root, icon: 'bi-credit-card' },
  { label: 'My tickets', href: ROUTES.tickets.mine, icon: 'bi-collection' },
  { label: 'Sell a ticket', href: ROUTES.tickets.new, icon: 'bi-plus-circle' },
];

export const guestNavItems: NavItem[] = [
  { label: 'Sign in', href: ROUTES.signIn, icon: 'bi-box-arrow-in-right' },
  { label: 'Sign up', href: ROUTES.signUp, icon: 'bi-person-plus' },
];

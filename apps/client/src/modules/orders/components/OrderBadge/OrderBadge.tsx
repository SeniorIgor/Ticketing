import clsx from 'clsx';

import type { OrderStatus } from '@/services/orders';
import { getOrderStatusBadgeClass, getOrderStatusLabel } from '@/utils';

type OrderBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderBadge({ status, className }: OrderBadgeProps) {
  return (
    <span className={clsx('badge', getOrderStatusBadgeClass(status), className)}>{getOrderStatusLabel(status)}</span>
  );
}

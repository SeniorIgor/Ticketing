'use client';

import { useEffect } from 'react';

import { useOrderExpireRefresh } from '../../hooks/useOrderExpireRefresh';
import { OrderCountdown } from '../OrderCountdown/OrderCountdown';

type Props = { expiresAtIso: string };

export function OrderCountdownWithRefresh({ expiresAtIso }: Props) {
  const { onExpire, cleanup } = useOrderExpireRefresh();

  useEffect(() => cleanup, [cleanup]);

  return <OrderCountdown expiresAtIso={expiresAtIso} onExpire={onExpire} />;
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type OrderCountdownProps = {
  expiresAtIso: string;
  onExpire?: () => void;
};

function clamp(value: number) {
  return Math.max(0, value);
}

function formatDuration(totalSeconds: number) {
  const seconds = clamp(totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainderSeconds).padStart(2, '0')}`;
}

export function OrderCountdown({ expiresAtIso, onExpire }: OrderCountdownProps) {
  const expiresAtMs = useMemo(() => new Date(expiresAtIso).getTime(), [expiresAtIso]);
  const [nowMs, setNowMs] = useState(Date.now());

  // ensure onExpire fires once
  const firedRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const secondsLeft = Math.floor((expiresAtMs - nowMs) / 1000);
  const expired = secondsLeft <= 0;

  useEffect(() => {
    if (!expired) {
      return;
    }
    if (firedRef.current) {
      return;
    }

    firedRef.current = true;
    onExpire?.();
  }, [expired, onExpire]);

  return (
    <div className={`fw-semibold ${expired ? 'text-danger' : 'text-success'}`}>
      {expired ? 'Expired' : `Time left: ${formatDuration(secondsLeft)}`}
    </div>
  );
}

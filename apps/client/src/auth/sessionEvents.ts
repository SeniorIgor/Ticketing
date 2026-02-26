export type UnauthorizedEventDetail = {
  requestId: string;
  url: string;
  method: string;
};

const EVENT_NAME = 'app:unauthorized';

export function emitUnauthorized(detail: UnauthorizedEventDetail): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.dispatchEvent(new CustomEvent<UnauthorizedEventDetail>(EVENT_NAME, { detail }));
  } catch {
    // ignore
  }
}

export function onUnauthorized(handler: (detail: UnauthorizedEventDetail) => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const e = event as CustomEvent<UnauthorizedEventDetail>;
    handler(e.detail);
  };

  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

export function safeInternalPath(next: string | null): string | null {
  if (!next) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(next);

    const url = new URL(decoded, window.location.origin);

    if (url.origin !== window.location.origin) {
      return null;
    }

    if (!url.pathname.startsWith('/')) {
      return null;
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

export function getNextFromLocation(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const next = params.get('next');

  return safeInternalPath(next);
}

import type { BackendError } from './errors';

export function isBackendError(payload: unknown): payload is BackendError {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  if (!('code' in payload) || !('message' in payload)) {
    return false;
  }

  return (
    typeof (payload as { code: unknown }).code === 'string' &&
    typeof (payload as { message: unknown }).message === 'string'
  );
}

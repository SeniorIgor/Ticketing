import type { RootState } from '../store';

/**
 * Only include slices that are "server-owned" and safe to hydrate.
 */
export type HydratableState = Pick<RootState, 'auth'>;

export type HydrationPayload = Partial<HydratableState>;

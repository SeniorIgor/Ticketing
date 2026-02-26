import type { RootState } from '@/store';

/**
 * Returns whether user is authenticated
 */
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

/**
 * Returns current user object
 */
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;

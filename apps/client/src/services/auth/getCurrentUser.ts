import { makeSafeRequest } from '@/http';

export interface CurrentUserResponse {
  currentUser: { id: string; email: string };
}

export function getCurrentUser() {
  return makeSafeRequest<CurrentUserResponse>('/api/v1/users/current-user', {
    method: 'GET',
  });
}

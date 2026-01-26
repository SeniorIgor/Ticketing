import { makeSafeRequest } from '@/http';

export function signoutUser() {
  return makeSafeRequest<void>('/api/v1/users/signout', {
    method: 'POST',
  });
}

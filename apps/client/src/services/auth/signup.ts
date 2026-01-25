import { makeSafeRequest } from '@/http';

import type { SignupRequest, SignupResponse } from './types';

export function signupUser(data: SignupRequest) {
  return makeSafeRequest<SignupResponse, SignupRequest>('/api/v1/users/signup', {
    method: 'POST',
    body: data,
  });
}

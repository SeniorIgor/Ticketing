import { makeSafeRequest } from '@/http';

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponse {
  id: string;
  email: string;
}

export function signinUser(data: SigninRequest) {
  return makeSafeRequest<SigninResponse, SigninRequest>('/api/v1/users/signin', {
    method: 'POST',
    body: data,
  });
}

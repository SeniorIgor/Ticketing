import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getRequestId, REQUEST_ID_HEADER } from '@/middleware/requestId';

import { handleAuthRedirect } from './authRedirect';

export async function proxy(request: NextRequest) {
  const requestId = getRequestId(request);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const redirectResponse = await handleAuthRedirect(request);
  if (redirectResponse) {
    redirectResponse.headers.set(REQUEST_ID_HEADER, requestId);
    return redirectResponse;
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

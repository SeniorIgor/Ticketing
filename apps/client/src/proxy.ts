import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { handleGuestOnlyRedirect } from './authRedirect';
import { getRequestId, REQUEST_ID_HEADER } from './requestId';

export function proxy(request: NextRequest) {
  // 1️⃣ Request ID
  const requestId = getRequestId(request);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  // 2️⃣ Auth redirect (if needed)
  const redirectResponse = handleGuestOnlyRedirect(request);

  if (redirectResponse) {
    redirectResponse.headers.set(REQUEST_ID_HEADER, requestId);
    return redirectResponse;
  }

  // 3️⃣ Continue request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

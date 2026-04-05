import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getRequestId, REQUEST_ID_HEADER } from '@/middleware';

import { handleAuthRedirect } from './middleware/authRedirect';

// function isPrefetchRequest(request: NextRequest) {
//   return request.headers.has('next-router-prefetch') || request.headers.get('purpose') === 'prefetch';
// }

export async function proxy(request: NextRequest) {
  const requestId = getRequestId(request);
  // const pathname = request.nextUrl.pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const authResult = await handleAuthRedirect(request, requestHeaders);

  if (authResult?.response) {
    const response = authResult.response;

    for (const setCookie of authResult.setCookies) {
      response.headers.append('set-cookie', setCookie);
    }

    // if (!isPrefetchRequest(request)) {
    //   console.info('[web]', {
    //     method: request.method,
    //     path: pathname,
    //     status: response.status,
    //     requestId,
    //     action: 'redirect',
    //   });
    // }

    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  // if (!isPrefetchRequest(request)) {
  //   console.info('[web]', {
  //     method: request.method,
  //     path: pathname,
  //     requestId,
  //   });
  // }

  const response = NextResponse.next({
    request: { headers: authResult?.requestHeaders ?? requestHeaders },
  });

  for (const setCookie of authResult?.setCookies ?? []) {
    response.headers.append('set-cookie', setCookie);
  }

  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

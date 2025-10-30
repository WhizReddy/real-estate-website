import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https:; worker-src 'self' blob:;"
  );

  return response;
}

const adminAuthMiddleware = withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        const role = typeof token?.role === 'string' ? token.role.toLowerCase() : undefined;
        return role === 'admin' || role === 'agent';
      },
    },
  }
);

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for static and public assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/uploads/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/clear-sw.js'
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Allow all API endpoints without middleware restriction - let individual route handlers decide auth
  if (pathname.startsWith('/api')) {
    return applySecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith('/admin')) {
    const response = await adminAuthMiddleware(req as NextRequestWithAuth, event);
    return response instanceof NextResponse ? applySecurityHeaders(response) : response;
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
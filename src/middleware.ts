import { NextRequest, NextResponse } from 'next/server';

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

function hasLegacyAdminSession(req: NextRequest) {
  const sessionCookie = req.cookies.get('adminSession');
  return typeof sessionCookie?.value === 'string' && sessionCookie.value.length > 20;
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for static and public assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/images/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js'
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return applySecurityHeaders(NextResponse.next());
    }

    if (!hasLegacyAdminSession(req)) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return applySecurityHeaders(NextResponse.redirect(redirectUrl));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
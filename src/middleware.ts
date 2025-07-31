import { NextResponse } from 'next/server';
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Add security headers
    const response = NextResponse.next();
    
    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy - Allow chunk loading and Google Fonts
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https:; worker-src 'self' blob:;"
    );

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect admin routes - allow both admin and agent roles
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin' || token?.role === 'agent';
        }
        
        // Allow all other routes
        return true;
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
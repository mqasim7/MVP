import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: Middleware runs on the server and doesn't have access to localStorage
// We'll use a different approach for route protection

export function middleware(request: NextRequest) {
  // For now, we'll let client-side handle authentication
  // The withAuth HOC will handle route protection
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
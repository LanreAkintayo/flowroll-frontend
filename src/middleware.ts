import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from localStorage via cookies
  // We store it as a cookie on login for middleware access
  const token = request.cookies.get('ui-foc-admin-token')?.value;

  const isLoginPage = pathname === '/login';
  const isDashboardPage = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/faqs') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/students') ||
    pathname.startsWith('/profile');

  // Not logged in and trying to access a protected page → redirect to login
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in and trying to access login → redirect to dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/faqs/:path*',
    '/notifications/:path*',
    '/students/:path*',
    '/profile/:path*',
  ],
};
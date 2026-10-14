import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore API requests and static assets
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get auth token and role from cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Specifically identify genuinely protected dashboard/checkout routes
  // Note: /vendors, /vendors/*, /vendor-profile, /vendor-terms, /vendor-support are PUBLIC storefront pages
  const isVendorDashboard = pathname === '/vendor' || pathname.startsWith('/vendor/');
  const isAdminDashboard = pathname === '/admin' || pathname.startsWith('/admin/');
  const isCustomerDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isCheckout = pathname === '/checkout' || pathname.startsWith('/checkout/');

  const isProtectedRoute = isVendorDashboard || isAdminDashboard || isCustomerDashboard || isCheckout;

  // If trying to access a protected route without auth token -> redirect to login with intended destination
  if (!authToken && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Strict role-based isolation: Admin area requires ADMIN or SUPER_ADMIN role
  if (isAdminDashboard) {
    if (userRole && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Note: For /vendor (protected vendor dashboard), requests from authenticated customers
  // proceed to ProtectedRoute, which presents a clear Access Denied & Vendor Application CTA
  // rather than an unexpected silent redirect loop.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
};

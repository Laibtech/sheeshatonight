import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { middlewareRateCheck, createMiddlewareProof, getClientIp } from '@/lib/rateLimiter';
import { verifyTokenEdge } from '@/lib/jwt';

/**
 * Validates Origin & Referer headers to protect state-changing requests against CSRF attacks
 */
function validateCsrfOrigin(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  // Safe idempotent methods do not need CSRF verification
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;

  const pathname = request.nextUrl.pathname;
  // Exempt cryptographically signature-verified webhooks
  if (pathname.startsWith('/api/payments/stripe/webhook')) return true;

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      const currentHost = request.nextUrl.host.toLowerCase();
      return originHost === currentHost;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererHost = new URL(referer).host.toLowerCase();
      const currentHost = request.nextUrl.host.toLowerCase();
      return refererHost === currentHost;
    } catch {
      return false;
    }
  }

  // If both origin and referer are missing, check if request relies on cookie auth
  const hasCookieAuth = !!request.cookies.get('auth_token')?.value;
  // Disallow cookie-authenticated mutative requests without origin/referer
  if (hasCookieAuth) {
    return false;
  }

  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle all API requests: Rate Limiting & CSRF Protection
  if (pathname.startsWith('/api')) {
    // 1. Enforce Rate Limiting across all API routes
    const rateLimitResponse = await middlewareRateCheck(request);
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Enforce CSRF Origin Verification on state-changing endpoints
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json(
        { success: false, error: 'CSRF validation failed: cross-origin mutative requests are prohibited' },
        { status: 403 }
      );
    }

    // Strip any client-supplied internal headers to prevent spoofing
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete('x-middleware-ratelimited');
    requestHeaders.delete('x-internal-ratelimit-proof');

    // Generate cryptographic transit proof that middleware verified rate limits
    const clientIp = getClientIp(request);
    const proof = await createMiddlewareProof(pathname, clientIp);
    requestHeaders.set('x-internal-ratelimit-proof', proof);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Ignore static assets
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get auth token and securely verify it via Edge WebCrypto rather than trusting unverified cookies
  const authToken = request.cookies.get('auth_token')?.value;
  let verifiedRole: string | null = null;

  if (authToken) {
    const decoded = await verifyTokenEdge(authToken);
    if (decoded) {
      verifiedRole = decoded.role;
    }
  }

  // Specifically identify protected routes
  const isVendorDashboard = pathname === '/vendor' || pathname.startsWith('/vendor/');
  const isAdminDashboard = pathname === '/admin' || pathname.startsWith('/admin/');
  const isCustomerDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isCheckout = pathname === '/checkout' || pathname.startsWith('/checkout/');

  const isProtectedRoute = isVendorDashboard || isAdminDashboard || isCustomerDashboard || isCheckout;

  // If trying to access a protected route without valid verified token -> redirect to login
  if (!verifiedRole && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Strict role-based isolation: Admin area requires verified ADMIN or SUPER_ADMIN role
  if (isAdminDashboard) {
    if (!verifiedRole || (verifiedRole !== 'ADMIN' && verifiedRole !== 'SUPER_ADMIN')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Strict role-based isolation: Vendor area requires verified VENDOR, ADMIN or SUPER_ADMIN role
  if (isVendorDashboard) {
    if (!verifiedRole || (verifiedRole !== 'VENDOR' && verifiedRole !== 'ADMIN' && verifiedRole !== 'SUPER_ADMIN')) {
      return NextResponse.redirect(new URL('/vendor-support', request.url));
    }
  }

  // Strict role-based isolation: Customer area redirection for admin/vendor accounts
  if (isCustomerDashboard) {
    if (verifiedRole === 'ADMIN' || verifiedRole === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (verifiedRole === 'VENDOR') {
      return NextResponse.redirect(new URL('/vendor', request.url));
    }
  }

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

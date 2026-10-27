import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

/**
 * GET /api/auth/dev-switch
 * Developer / QA helper route to switch active authentication session in browser
 */
export async function GET(request: NextRequest) {
  // Completely disable dev switch in production mode to prevent unauthorized privilege escalation
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Require an explicit DEV_SWITCH_SECRET to prevent unauthorized privilege escalation
  const devSecret = process.env.DEV_SWITCH_SECRET;
  if (!devSecret) {
    return NextResponse.json(
      { error: 'Dev switch is disabled (DEV_SWITCH_SECRET is unconfigured)' },
      { status: 403 }
    );
  }

  const providedSecret = request.headers.get('x-dev-secret') || new URL(request.url).searchParams.get('secret');
  if (providedSecret !== devSecret) {
    return NextResponse.json({ error: 'Unauthorized dev-switch request' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const role = (searchParams.get('role') || 'ADMIN').toUpperCase();
  const email = searchParams.get('email');
  const redirectTo = searchParams.get('redirect') || (role === 'ADMIN' ? '/admin/finance' : '/vendor/orders');

  const where: any = {};
  if (email) {
    where.email = email;
  } else {
    where.role = role as any;
  }

  const user = await prisma.user.findFirst({
    where,
    include: { vendor: true },
  });

  if (!user) {
    return NextResponse.json({ error: `No user found for query` }, { status: 404 });
  }

  let vendorId = user.vendor?.id;
  let vendor = user.vendor;
  if (!vendorId && user.role === 'VENDOR') {
    const firstVendor = await prisma.vendor.findFirst();
    vendorId = firstVendor?.id;
    vendor = firstVendor as any;
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    vendorId,
    vendor: vendor
      ? {
          id: vendor.id,
          name: vendor.name,
          slug: vendor.slug,
        }
      : undefined,
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Switching Session...</title>
</head>
<body style="font-family:sans-serif;background:#0f0716;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <h2 style="color:#D4AF37;">Authenticating ${user.role}...</h2>
    <p style="color:#94a3b8;">Redirecting to ${redirectTo}</p>
  </div>
  <script>
    localStorage.setItem('auth_token', ${JSON.stringify(token)});
    localStorage.setItem('user_role', ${JSON.stringify(user.role)});
    localStorage.setItem('user_name', ${JSON.stringify(user.name)});
    ${vendor ? `localStorage.setItem('vendor_name', ${JSON.stringify(vendor.name)});` : `localStorage.removeItem('vendor_name');`}
    document.cookie = 'auth_token=' + encodeURIComponent(${JSON.stringify(token)}) + '; path=/; max-age=604800;';
    document.cookie = 'user_role=' + encodeURIComponent(${JSON.stringify(user.role)}) + '; path=/; max-age=604800;';
    document.cookie = 'user_email=' + encodeURIComponent(${JSON.stringify(user.email)}) + '; path=/; max-age=604800;';
    document.cookie = 'user_name=' + encodeURIComponent(${JSON.stringify(user.name)}) + '; path=/; max-age=604800;';
    ${vendor ? `document.cookie = 'vendor_name=' + encodeURIComponent(${JSON.stringify(vendor.name)}) + '; path=/; max-age=604800;';` : `document.cookie = 'vendor_name=; path=/; max-age=0;';`}
    window.location.replace(${JSON.stringify(redirectTo)});
  </script>
</body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });

  response.cookies.set('auth_token', token, {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set('user_role', user.role, {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set('user_email', user.email, {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set('user_name', user.name, {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    vendorId?: string;
    vendor?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  const tokenFromHeader = extractToken(authHeader || '');
  if (tokenFromHeader) return tokenFromHeader;

  const cookieToken = req.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  return null;
}

/**
 * Middleware to check authentication
 */
export function withAuth(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest, ...args: any[]) => {
    try {
      if (args[0]?.params && typeof args[0].params.then === 'function') {
        args[0].params = await args[0].params;
      }
      const token = getTokenFromRequest(req);

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized: No token provided' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid token' },
          { status: 401 }
        );
      }

      req.user = decoded;
      return handler(req, ...args);
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to check if user is admin
 */
export function withAdmin(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return withAuth(async (req: AuthenticatedRequest, ...args: any[]) => {
    if (req.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin role required' },
        { status: 403 }
      );
    }
    return handler(req, ...args);
  });
}

/**
 * Middleware to check if user is admin or staff
 */
export function withAdminOrStaff(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return withAuth(async (req: AuthenticatedRequest, ...args: any[]) => {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Staff role required' },
        { status: 403 }
      );
    }
    return handler(req, ...args);
  });
}

/**
 * Middleware to check if user is vendor
 */
export function withVendor(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return withAuth(async (req: AuthenticatedRequest, ...args: any[]) => {
    if (req.user?.role !== 'VENDOR' && req.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Vendor role required' },
        { status: 403 }
      );
    }
    return handler(req, ...args);
  });
}

/**
 * Error response helper
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: Record<string, any>
) {
  const responseBody: any = { error: message };

  if (code) {
    responseBody.code = code;
  }
  if (details) {
    responseBody.details = details;
  }

  return NextResponse.json(responseBody, { status });
}

/**
 * Success response helper
 */
export function successResponse(data: any, messageOrStatus: string | number = 200, status?: number) {
  let responseStatus = 200;
  let message: string | undefined;

  if (typeof messageOrStatus === 'number') {
    responseStatus = messageOrStatus;
  } else {
    message = messageOrStatus;
    responseStatus = status ?? 200;
  }

  const responseBody: any = {
    success: true,
    data,
  };

  if (message) {
    responseBody.message = message;
  }

  return NextResponse.json(responseBody, { status: responseStatus });
}

/**
 * Set auth cookie
 */
export function setAuthCookie(
  token: string,
  response: NextResponse,
  roleOrUser?: string | { email?: string; name?: string; role?: string; vendorName?: string }
) {
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  const role = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role;
  const email = typeof roleOrUser === 'object' ? roleOrUser?.email : undefined;
  const name = typeof roleOrUser === 'object' ? roleOrUser?.name : undefined;
  const vendorName = typeof roleOrUser === 'object' ? roleOrUser?.vendorName : undefined;

  // Also set user_role cookie for client-side routing
  if (role) {
    response.cookies.set('user_role', role, {
      httpOnly: false, // Allow JavaScript to read this
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  }

  if (email) {
    response.cookies.set('user_email', email, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  }

  if (name) {
    response.cookies.set('user_name', encodeURIComponent(name), {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  }

  if (vendorName) {
    response.cookies.set('vendor_name', encodeURIComponent(vendorName), {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  } else if (role !== 'VENDOR') {
    response.cookies.delete('vendor_name');
  }

  response.cookies.set('user_logged_in', 'true', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  
  return response;
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(response: NextResponse) {
  const isProd = process.env.NODE_ENV === 'production';
  
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  response.cookies.set('user_role', '', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('user_email', '', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('user_name', '', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('vendor_name', '', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('user_logged_in', '', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}

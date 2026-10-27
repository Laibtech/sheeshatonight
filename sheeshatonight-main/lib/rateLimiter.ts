import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiter for production use
 * For distributed systems, consider using Redis
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  prefix?: string; // Prefix to isolate different endpoints/limiters
  windowMs?: number; // Time window in milliseconds (default: 15 minutes)
  maxRequests?: number; // Max requests per window (default: 100)
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  handler?: (req: NextRequest) => NextResponse; // Custom response handler
}

/**
 * Robust IP resolution with proxy handling and validation
 * Prioritizes trusted Cloudflare header, then verified proxy headers
 */
export function getClientIp(req: NextRequest): string {
  // If behind Cloudflare edge, Cloudflare sets CF-Connecting-IP (cannot be spoofed externally)
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // Reverse proxy headers (trusted when TRUST_PROXY is explicitly enabled, or during local development test simulation)
  const isDev = process.env.NODE_ENV !== 'production';
  const trustProxy = process.env.TRUST_PROXY === 'true' || isDev;

  if (trustProxy) {
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp.trim();

    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim();
      if (first) return first;
    }
  }

  // Socket/direct IP or fallback
  // @ts-ignore
  return req.ip || '127.0.0.1';
}

/**
 * Reset rate limit store (used in testing or maintenance)
 */
export function resetRateLimits() {
  Object.keys(store).forEach((k) => delete store[k]);
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const prefix = options.prefix || 'global';
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const maxRequests = options.maxRequests || 100;
  const keyGenerator = options.keyGenerator || ((req: NextRequest) => `${prefix}:${getClientIp(req)}`);
  const handler = options.handler;

  return async (req: NextRequest) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or get record
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null; // Allow request
    }

    const record = store[key];

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return null; // Allow request
    }

    // Check limit
    if (record.count >= maxRequests) {
      return (
        handler?.(req) ||
        NextResponse.json(
          {
            success: false,
            error: 'Too many requests. Please slow down and try again later.',
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
            },
          }
        )
      );
    }

    record.count++;
    return null; // Allow request
  };
}

/**
 * Create rate limiters for specific endpoints with isolated namespaces
 */
export const rateLimiters = {
  /**
   * Auth endpoints - strict brute force protection
   */
  auth: rateLimit({
    prefix: 'auth',
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
  }),

  /**
   * File upload endpoints - prevent disk exhaustion
   */
  upload: rateLimit({
    prefix: 'upload',
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: process.env.NODE_ENV === 'production' ? 10 : 100,
  }),

  /**
   * Checkout & Orders endpoints - prevent payment/order flooding
   */
  checkout: rateLimit({
    prefix: 'checkout',
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: process.env.NODE_ENV === 'production' ? 20 : 200,
  }),

  /**
   * API endpoints - general rate limit
   */
  api: rateLimit({
    prefix: 'api',
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: process.env.NODE_ENV === 'production' ? 120 : 1000,
  }),

  /**
   * Public endpoints - lenient limits
   */
  public: rateLimit({
    prefix: 'public',
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 300,
  }),

  /**
   * Create custom limiter
   */
  custom: (options: RateLimitOptions) => rateLimit(options),
};

/**
 * Unified rate checker for use in Next.js middleware across all /api routes
 */
export async function middlewareRateCheck(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/api')) return null;

  // Stricter limiter for auth endpoints
  if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
    return rateLimiters.auth(req);
  }

  // Upload limiter
  if (pathname.startsWith('/api/upload')) {
    return rateLimiters.upload(req);
  }

  // Checkout limiter
  if (pathname.startsWith('/api/checkout') || pathname.startsWith('/api/cart/checkout')) {
    return rateLimiters.checkout(req);
  }

  // General API limiter
  return rateLimiters.api(req);
}

/**
 * Clean up old records periodically (every 10 minutes)
 */
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      const entry = store[key];
      if (entry && entry.resetTime < now) {
        delete store[key];
      }
    });
  }, 10 * 60 * 1000);
}

// Internal gateway secret for authenticating middleware-to-route transit proofs
const GATEWAY_SECRET =
  process.env.INTERNAL_GATEWAY_SECRET ||
  'sheeshatonight_gateway_token_internal_' + (process.env.JWT_SECRET || 'secret');

/**
 * Generate a cryptographic proof that middleware successfully rate-limited this request.
 * Uses native Web Crypto API (SubtleCrypto) compatible with both Edge and Node.js runtimes.
 */
export async function createMiddlewareProof(pathname: string, ip: string): Promise<string> {
  const windowTime = Math.floor(Date.now() / 10000); // 10-second rolling window
  const message = `${pathname}:${ip}:${windowTime}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(GATEWAY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${windowTime}.${hex}`;
}

/**
 * Verify whether the proof was generated by our trusted middleware and not forged by a client.
 */
export async function verifyMiddlewareProof(req: NextRequest): Promise<boolean> {
  const proof = req.headers.get('x-internal-ratelimit-proof');
  if (!proof || !proof.includes('.')) return false;

  const [windowStr, signature] = proof.split('.');
  if (!windowStr || !signature) return false;
  const proofWindow = parseInt(windowStr, 10);
  if (isNaN(proofWindow)) return false;

  const currentWindow = Math.floor(Date.now() / 10000);
  // Allow ±1 window (10 seconds) for network/processing delay
  if (Math.abs(currentWindow - proofWindow) > 1) return false;

  const pathname = req.nextUrl?.pathname || '';
  const ip = getClientIp(req);
  const message = `${pathname}:${ip}:${proofWindow}`;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(GATEWAY_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const matches = signature.match(/.{1,2}/g);
    if (!matches) return false;
    const sigBytes = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));

    return await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(message));
  } catch {
    return false;
  }
}

/**
 * Rate limit wrapper for API handlers with cryptographic proof verification
 */
export function withRateLimit(
  limiter: ReturnType<typeof rateLimit>,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // Only trust bypass if request carries a valid cryptographic proof generated by middleware
    const isVerifiedFromMiddleware = await verifyMiddlewareProof(req);
    if (isVerifiedFromMiddleware) {
      return handler(req);
    }
    const limitResponse = await limiter(req);
    if (limitResponse) {
      return limitResponse;
    }
    return handler(req);
  };
}

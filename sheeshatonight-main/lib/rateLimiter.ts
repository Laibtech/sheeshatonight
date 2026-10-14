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
  windowMs?: number; // Time window in milliseconds (default: 15 minutes)
  maxRequests?: number; // Max requests per window (default: 100)
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  handler?: (req: NextRequest) => NextResponse; // Custom response handler
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||

    'unknown';
  return `rate-limit:${ip}`;
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const maxRequests = options.maxRequests || 100;
  const keyGenerator = options.keyGenerator || defaultKeyGenerator;
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
            error: 'Too many requests. Please try again later.',
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
 * Create rate limiters for specific endpoints
 */

export const rateLimiters = {
  /**
   * Auth endpoints - stricter limits
   */
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: process.env.NODE_ENV === 'production' ? 15 : 200,
  }),

  /**
   * API endpoints - moderate limits
   */
  api: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  }),

  /**
   * Public endpoints - lenient limits
   */
  public: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 300, // 300 requests per minute
  }),

  /**
   * Create custom limiter
   */
  custom: (options: RateLimitOptions) => rateLimit(options),
};

/**
 * Clean up old records periodically (every 30 minutes)
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
  }, 30 * 60 * 1000);
}

/**
 * Rate limit wrapper for API handlers
 */
export function withRateLimit(
  limiter: ReturnType<typeof rateLimit>,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const limitResponse = await limiter(req);
    if (limitResponse) {
      return limitResponse;
    }
    return handler(req);
  };
}

import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'default-secret-key') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[SECURITY FATAL] JWT_SECRET is unconfigured or using an insecure default in production mode.');
    }
    return 'sheeshatonight_jwt_dev_insecure_fallback_secret_32_chars';
  }
  return secret;
}

const JWT_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  vendorId?: string;
  vendor?: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Edge Runtime compatible JWT verification using Web Crypto API (SubtleCrypto)
 * Fully compliant with Next.js Edge Middleware and zero Node.js crypto dependencies
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;
    const headerB64: string = parts[0];
    const payloadB64: string = parts[1];
    const signatureB64: string = parts[2];

    // Decode base64url signature
    let base64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const signatureBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // Data to verify
    const dataBytes = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const secret = getJwtSecret();
    const keyBytes = new TextEncoder().encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, dataBytes);
    if (!isValid) return null;

    // Decode payload
    let payloadBase64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    while (payloadBase64.length % 4) payloadBase64 += '=';
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(payloadBase64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonStr) as JWTPayload & { exp?: number };

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

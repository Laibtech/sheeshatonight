import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash password using bcryptjs with 12 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcryptjs.genSalt(SALT_ROUNDS);
    const hashed = await bcryptjs.hash(password, salt);
    return hashed;
  } catch (error) {
    throw new Error('Password hashing failed');
  }
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    if (!password || !hash) return false;
    return await bcryptjs.compare(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (OWASP aligned)
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (password.length > 72) {
    return { valid: false, message: 'Password must not exceed 72 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
  }
  return { valid: true, message: 'Password is strong' };
}

/**
 * Validate input fields
 */
export function validateRegisterInput(data: any): { valid: boolean; error?: string } {
  const { name, email, password, confirmPassword } = data;

  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (!email || !validateEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { valid: false, error: passwordValidation.message };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }

  return { valid: true };
}

/**
 * Validate login input
 */
export function validateLoginInput(data: any): { valid: boolean; error?: string } {
  const { email, password } = data;

  if (!email || !validateEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required' };
  }

  return { valid: true };
}

import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export interface VerifiedUser {
  id: string;
  email: string;
  role: string;
  vendor?: {
    id: string;
    name: string;
    slug: string;
  };
}

export async function verifyTokenAndGetUser(token: string): Promise<VerifiedUser | null> {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { vendor: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    vendor: user.vendor
      ? {
          id: user.vendor.id,
          name: user.vendor.name,
          slug: user.vendor.slug,
        }
      : undefined,
  };
}

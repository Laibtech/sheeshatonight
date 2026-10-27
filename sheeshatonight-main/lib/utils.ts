import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from './prisma';

/**
 * Response Formatters
 */

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  message?: string;
}

/**
 * Format success response
 */
export function formatSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Format error response
 */
export function formatErrorResponse(
  error: string,
  code?: string,
  details?: Record<string, any>
): ErrorResponse {
  return {
    success: false,
    error,
    ...(code && { code }),
    ...(details && { details }),
  };
}

/**
 * Format paginated response
 */
export function formatPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  message?: string
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore,
    },
    ...(message && { message }),
  };
}

/**
 * Order Number Generator
 * Format: ORD-YYYY-NNNN (e.g., ORD-2026-0001)
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  // Get the count of orders created this year
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const orderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  // Increment and pad with zeros (4 digits)
  const nextNumber = (orderCount + 1).toString().padStart(4, '0');

  return `${prefix}${nextNumber}`;
}

/**
 * Price Formatter
 * Formats decimal price with currency
 */
export function formatPrice(price: number | string, currency: string = 'AED'): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

/**
 * Parse price string to number
 */
export function parsePrice(price: string): number {
  const cleaned = price.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned);
}

/**
 * Date Utilities
 */

/**
 * Format date to ISO string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Format date for display (e.g., "Jan 15, 2026")
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * IP Address Extraction
 */

/**
 * Extract client IP address from request
 * Handles various proxy headers
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    const first = forwardedFor.split(',')[0];
    return first ? first.trim() : 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return 'unknown';
}

/**
 * Audit Logging
 */

/**
 * Create audit log entry
 */
export async function createAuditLog(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  beforeState: any,
  afterState: any,
  request: NextRequest
): Promise<void> {
  try {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        beforeState: beforeState ? JSON.stringify(beforeState) : null,
        afterState: afterState ? JSON.stringify(afterState) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging failure shouldn't break the main operation
  }
}

/**
 * String Utilities
 */

/**
 * Generate slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Truncate string to specified length
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validation Helpers
 */

/**
 * Check if string is valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if string is valid phone (E.164 format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Check if string is valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Array Utilities
 */

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Random Generators
 */

/**
 * Generate cryptographically secure random string
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    result += chars.charAt(randomIndex);
  }
  return result;
}

/**
 * Generate cryptographically secure random number between min and max (inclusive)
 */
export function randomNumber(min: number, max: number): number {
  return crypto.randomInt(min, max + 1);
}

/**
 * Object Utilities
 */

/**
 * Remove null and undefined values from object
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Security & Password Utilities
 */

import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate cryptographically secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset.charAt(randomIndex);
  }
  return password;
}

/**
 * Normalize email (lowercase and trim)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Mask sensitive email (e.g., "user@example.com" -> "u***@example.com")
 */
export function maskEmail(email: string): string {
  const parts = email.split('@');
  const username = parts[0] || '';
  const domain = parts[1] || '';
  if (username.length <= 1) {
    return `*@${domain}`;
  }
  return `${username[0]}${'*'.repeat(Math.max(0, username.length - 2))}@${domain}`;
}

/**
 * Generate cryptographically secure OTP (One-Time Password)
 */
export function generateOTP(length: number = 6): string {
  const chars = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    otp += chars.charAt(randomIndex);
  }
  return otp;
}

/**
 * Sanitize plain text input: strip dangerous characters to prevent stored XSS and injection
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize HTML content: strips script tags, iframe, object, embed, event handlers
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '')
    .replace(/javascript:[^"']*/gi, '');
}

/**
 * Safe JSON serializer for embedding inside <script type="application/ld+json">
 * Prevents script breakout XSS by encoding '<', '>', '&', and line terminators
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Error Handling
 */

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Error Handling
 */

/**
 * Check if error is Prisma error
 */
export function isPrismaError(error: any): boolean {
  return error?.code?.startsWith('P');
}

/**
 * Get user-friendly error message from Prisma error
 */
export function getPrismaErrorMessage(error: any): string {
  if (!isPrismaError(error)) {
    return 'An unexpected error occurred';
  }

  switch (error.code) {
    case 'P2002':
      return 'A record with this value already exists';
    case 'P2025':
      return 'Record not found';
    case 'P2003':
      return 'Invalid reference to related record';
    case 'P2014':
      return 'Invalid relation';
    default:
      return 'Database operation failed';
  }
}

/**
 * Sleep utility for testing or rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pagination Utilities
 */

/**
 * Extract pagination params from query string
 */
export function getPaginationParams(searchParams: URLSearchParams): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return { page, pageSize, skip, take };
}

/**
 * Build paginated response object
 */
export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return formatPaginatedResponse(data, page, pageSize, total);
}

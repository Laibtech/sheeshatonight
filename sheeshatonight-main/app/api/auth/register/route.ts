import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validateRegisterInput } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';
import { setAuthCookie } from '@/lib/middleware';
import { rateLimiters, withRateLimit } from '@/lib/rateLimiter';

/**
 * POST /api/auth/register
 * Register a new user
 */
export const POST = withRateLimit(rateLimiters.auth, async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, email, phone, password, confirmPassword, role = 'CUSTOMER' } = body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (name || '').trim();
    const normalizedPhone = (phone || '').trim() || null;

    // Validate input
    const validation = validateRegisterInput({ name: trimmedName, email: normalizedEmail, password, confirmPassword });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Check if phone already exists
    if (normalizedPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists.' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Public registration always assigns CUSTOMER server-side.
    // Vendor accounts must onboard through /api/auth/register/vendor or /api/vendor/apply with KYC verification.
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });

    // Generate JWT token for customer
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response and set auth cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    return setAuthCookie(token, response, {
      role: user.role,
      email: user.email,
      name: user.name,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error?.code === 'P2002') {
      const target = String(error?.meta?.target || '');
      if (target.includes('phone')) {
        return NextResponse.json(
          { error: 'This phone number is already registered to another account.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
});

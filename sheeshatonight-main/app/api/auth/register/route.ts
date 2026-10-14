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

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: role === 'VENDOR' ? 'VENDOR' : 'CUSTOMER',
        status: 'ACTIVE',
      },
    });

    let vendorRecord = null;
    if (user.role === 'VENDOR') {
      const baseSlug = (trimmedName || 'vendor').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `vendor-${user.id.slice(-6)}`;
      const existingSlug = await prisma.vendor.findUnique({ where: { slug: baseSlug } });
      const finalSlug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
      vendorRecord = await prisma.vendor.create({
        data: {
          userId: user.id,
          name: trimmedName || 'Vendor Lounge',
          slug: finalSlug,
          phone: normalizedPhone,
          location: 'Dubai, UAE',
          isActive: true,
          tier: 'SOLO',
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      vendorId: vendorRecord?.id,
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
          vendorId: vendorRecord?.id,
          vendorName: vendorRecord?.name,
        },
        vendor: vendorRecord ? { id: vendorRecord.id, name: vendorRecord.name, slug: vendorRecord.slug } : undefined,
      },
      { status: 201 }
    );

    return setAuthCookie(token, response, {
      role: user.role,
      email: user.email,
      name: user.name,
      vendorName: vendorRecord?.name,
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

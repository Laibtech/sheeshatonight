import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/jwt';
import { comparePassword, hashPassword, validatePassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  const token = extractToken(authHeader || '');
  if (token) return token;

  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  const cookieHeader = request.headers.get('cookie');
  const match = cookieHeader?.match(/(?:^|; )auth_token=([^;]*)/);
  if (match && match[1]) return decodeURIComponent(match[1]);

  return null;
}

/**
 * GET /api/users/me
 * Get current authenticated user info
 */
export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        locale: true,
        verified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Account is inactive or suspended' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/me
 * Update authenticated user profile or password
 */
export async function PUT(request: NextRequest) {
  try {
    const token = getToken(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Account is inactive or suspended' },
        { status: 403 }
      );
    }

    const updateData: { name?: string; phone?: string; password?: string } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'Name must be at least 2 characters' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      const trimmedPhone = typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null;
      if (trimmedPhone && trimmedPhone !== user.phone) {
        const existingPhone = await prisma.user.findFirst({
          where: {
            phone: trimmedPhone,
            id: { not: user.id },
          },
        });
        if (existingPhone) {
          return NextResponse.json(
            { success: false, error: 'This phone number is already registered to another account' },
            { status: 400 }
          );
        }
      }
      updateData.phone = trimmedPhone as any;
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required to set a new password' },
          { status: 400 }
        );
      }

      const isCurrentValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      const passValidation = validatePassword(newPassword);
      if (!passValidation.valid) {
        return NextResponse.json(
          { success: false, error: passValidation.message },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        locale: true,
        verified: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

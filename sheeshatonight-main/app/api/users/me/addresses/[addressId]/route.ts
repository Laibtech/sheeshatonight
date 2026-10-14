import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/middleware';
import { verifyTokenAndGetUser } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { updateAddressSchema } from '@/lib/validation';

function extractTokenFromReq(request: Request): string | null {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookieHeader = request.headers.get('cookie');
  const match = cookieHeader?.match(/(?:^|; )auth_token=([^;]*)/);
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * GET /api/users/me/addresses/[addressId]
 * Get specific address
 */
export async function GET(request: Request, { params }: { params: Promise<{ addressId: string }> | { addressId: string } }) {
  try {
    const { addressId } = await params;
    const token = extractTokenFromReq(request);

    if (!token || !verifyToken(token)) {
      return errorResponse('Authentication required', 401);
    }

    const user = await verifyTokenAndGetUser(token);
    if (!user) {
      return errorResponse('User not found or inactive', 401);
    }

    const userId = user.id;

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return errorResponse('Address not found', 404);
    }

    if (address.userId !== userId) {
      return errorResponse('Access denied', 403);
    }

    return NextResponse.json(
      successResponse(address, 'Address retrieved successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get address error:', error);
    return errorResponse('Failed to retrieve address', 500);
  }
}

/**
 * PUT /api/users/me/addresses/[addressId]
 * Update address
 */
export async function PUT(request: Request, { params }: { params: Promise<{ addressId: string }> | { addressId: string } }) {
  try {
    const { addressId } = await params;
    const token = extractTokenFromReq(request);

    if (!token || !verifyToken(token)) {
      return errorResponse('Authentication required', 401);
    }

    const user = await verifyTokenAndGetUser(token);
    if (!user) {
      return errorResponse('User not found or inactive', 401);
    }

    const userId = user.id;

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return errorResponse('Address not found', 404);
    }

    if (address.userId !== userId) {
      return errorResponse('Access denied', 403);
    }

    const body = await request.json();
    const validation = updateAddressSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('Validation failed', 400, 'VALIDATION_ERROR',
        Object.fromEntries(
          validation.error.errors.map(e => [e.path.join('.'), e.message])
        )
      );
    }

    // If setting as default, unset other defaults
    if (validation.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: addressId }, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updateData: any = {};
    if (validation.data.label !== undefined) updateData.label = validation.data.label;
    if (validation.data.street !== undefined) updateData.street = validation.data.street;
    if (validation.data.building !== undefined) updateData.building = validation.data.building;
    if (validation.data.city !== undefined) updateData.city = validation.data.city;
    if (validation.data.country !== undefined) updateData.country = validation.data.country;
    if (validation.data.zipcode !== undefined) updateData.zipcode = validation.data.zipcode;
    if (validation.data.isDefault !== undefined) updateData.isDefault = validation.data.isDefault;

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });

    return NextResponse.json(
      successResponse(updatedAddress, 'Address updated successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update address error:', error);
    return errorResponse('Failed to update address', 500);
  }
}

/**
 * DELETE /api/users/me/addresses/[addressId]
 * Delete address
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ addressId: string }> | { addressId: string } }) {
  try {
    const { addressId } = await params;
    const token = extractTokenFromReq(request);

    if (!token || !verifyToken(token)) {
      return errorResponse('Authentication required', 401);
    }

    const user = await verifyTokenAndGetUser(token);
    if (!user) {
      return errorResponse('User not found or inactive', 401);
    }

    const userId = user.id;

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return errorResponse('Address not found', 404);
    }

    if (address.userId !== userId) {
      return errorResponse('Access denied', 403);
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json(
      { success: true, message: 'Address deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete address error:', error);
    return errorResponse('Failed to delete address', 500);
  }
}

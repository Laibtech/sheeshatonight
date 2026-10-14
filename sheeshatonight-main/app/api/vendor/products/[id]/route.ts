import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/middleware';
import { verifyTokenAndGetUser } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import { updateProductSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/utils';

async function getAuthenticatedVendor(request: Request | NextRequest) {
  const authorization = request.headers.get('authorization');
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  const cookieHeader = request.headers.get('cookie');
  const cookieToken = cookieHeader?.split('; ').find(c => c.startsWith('auth_token='))?.split('=')[1];
  const token = bearerToken || cookieToken;

  if (!token || !verifyToken(token)) {
    return null;
  }

  const user = await verifyTokenAndGetUser(token);
  if (!user || user.role !== 'VENDOR' || !user.vendor?.id) {
    return null;
  }

  return user;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedVendor(request);
    if (!user) {
      return errorResponse('Vendor access required', 403);
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorId: user.vendor!.id,
      },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return successResponse(product);
  } catch (error) {
    console.error('Vendor product GET error:', error);
    return errorResponse('Failed to fetch product', 500);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedVendor(request);
    if (!user) {
      return errorResponse('Vendor access required', 403);
    }

    const body = await request.json();
    const partial = updateProductSchema.safeParse(body);

    if (!partial.success) {
      return errorResponse('Validation failed', 400);
    }

    const existing = await prisma.product.findFirst({
      where: { id, vendorId: user.vendor!.id },
    });

    if (!existing) {
      return errorResponse('Product not found', 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: partial.data,
    });

    await createAuditLog(user.id, 'PRODUCT_UPDATED', 'Product', id, existing, updated, request as NextRequest);

    return successResponse(updated, 'Product updated successfully');
  } catch (error) {
    console.error('Vendor product PATCH error:', error);
    return errorResponse('Failed to update product', 500);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedVendor(request);
    if (!user) {
      return errorResponse('Vendor access required', 403);
    }

    const product = await prisma.product.findFirst({
      where: { id, vendorId: user.vendor!.id },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await createAuditLog(user.id, 'PRODUCT_DELETED', 'Product', id, product, null, request as NextRequest);

    return successResponse(null, 'Product deleted successfully');
  } catch (error) {
    console.error('Vendor product DELETE error:', error);
    return errorResponse('Failed to delete product', 500);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedVendor(request);
    if (!user) {
      return errorResponse('Vendor access required', 403);
    }

    const { action } = await request.json();

    const product = await prisma.product.findFirst({
      where: { id, vendorId: user.vendor!.id },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    let updated;
    switch (action) {
      case 'toggle-active':
        updated = await prisma.product.update({
          where: { id },
          data: { isActive: !product.isActive },
        });
        break;
      default:
        return errorResponse('Invalid action', 400);
    }

    await createAuditLog(user.id, `PRODUCT_${action.toUpperCase()}`, 'Product', id, product, updated, request as NextRequest);

    return successResponse(updated, 'Action completed successfully');
  } catch (error) {
    console.error('Vendor product action error:', error);
    return errorResponse('Action failed', 500);
  }
}

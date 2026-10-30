import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const GET = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;
    const rental = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          select: { id: true, name: true, slug: true, tier: true, location: true },
        },
      },
    });

    if (!rental || rental.deletedAt) {
      return errorResponse('Rental package not found', 404);
    }

    return successResponse(rental);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch rental', 500);
  }
});

export const PATCH = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Rental package not found', 404);
    }

    const data: any = { ...body };
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.rentalHourlyPrice !== undefined) data.rentalHourlyPrice = data.rentalHourlyPrice ? Number(data.rentalHourlyPrice) : null;
    if (data.rentalDurationHours !== undefined) data.rentalDurationHours = data.rentalDurationHours ? Number(data.rentalDurationHours) : null;
    if (data.securityDeposit !== undefined) data.securityDeposit = data.securityDeposit ? Number(data.securityDeposit) : null;
    if (data.deliveryCharge !== undefined) data.deliveryCharge = data.deliveryCharge ? Number(data.deliveryCharge) : null;
    if (data.stock !== undefined) data.stock = Number(data.stock);
    if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);
    if (data.isFeatured !== undefined) data.isFeatured = Boolean(data.isFeatured);
    if (Array.isArray(data.images)) data.images = JSON.stringify(data.images);

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        vendor: { select: { id: true, name: true } },
      },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'UPDATE_RENTAL_LISTING',
      resourceType: 'RENTAL',
      resourceId: id,
      beforeState: existing,
      afterState: updated,
    });

    return successResponse(updated, 'Rental listing updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update rental', 500);
  }
});

export const DELETE = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;

    // Soft delete to protect order history integrity
    const updated = await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'DELETE_RENTAL_LISTING',
      resourceType: 'RENTAL',
      resourceId: id,
      afterState: { deletedAt: updated.deletedAt },
    });

    return successResponse(null, 'Rental listing removed safely from active marketplace');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to delete rental', 500);
  }
});


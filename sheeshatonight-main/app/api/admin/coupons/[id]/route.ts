import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

/**
 * PUT /api/admin/coupons/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const {
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        startDate,
        expiryDate,
        isActive,
      } = body;

      const updated = await prisma.coupon.update({
        where: { id },
        data: {
          ...(code ? { code: code.trim().toUpperCase() } : {}),
          ...(discountType ? { discountType } : {}),
          ...(discountValue !== undefined ? { discountValue: Number(discountValue) } : {}),
          ...(minOrderAmount !== undefined ? { minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null } : {}),
          ...(maxDiscount !== undefined ? { maxDiscount: maxDiscount ? Number(maxDiscount) : null } : {}),
          ...(usageLimit !== undefined ? { usageLimit: usageLimit ? Number(usageLimit) : null } : {}),
          ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
          ...(expiryDate !== undefined ? { expiryDate: expiryDate ? new Date(expiryDate) : null } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        },
      });

      return successResponse({
        coupon: {
          ...updated,
          discountValue: Number(updated.discountValue),
        },
      }, 'Coupon updated successfully');
    } catch (error: any) {
      console.error('Update coupon error:', error);
      return errorResponse(error.message || 'Failed to update coupon', 500);
    }
  })(request);
}

/**
 * DELETE /api/admin/coupons/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async () => {
    try {
      await prisma.coupon.delete({
        where: { id },
      });
      return successResponse({ id }, 'Coupon deleted successfully');
    } catch (error) {
      console.error('Delete coupon error:', error);
      return errorResponse('Failed to delete coupon', 500);
    }
  })(request);
}

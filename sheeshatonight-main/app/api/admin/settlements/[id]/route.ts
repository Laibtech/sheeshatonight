import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { SettlementStatus } from '@prisma/client';

/**
 * PUT /api/admin/settlements/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { status, amount, commission, period } = body;

      const updated = await prisma.settlement.update({
        where: { id },
        data: {
          ...(status ? { status: status as SettlementStatus } : {}),
          ...(status === 'PAID' ? { paidAt: new Date() } : {}),
          ...(amount !== undefined ? { amount: Number(amount) } : {}),
          ...(commission !== undefined ? { commission: Number(commission) } : {}),
          ...(period ? { period } : {}),
        },
      });

      return successResponse({
        settlement: {
          ...updated,
          amount: Number(updated.amount),
          commission: Number(updated.commission),
        },
      }, 'Settlement updated successfully');
    } catch (error: any) {
      console.error('Update settlement error:', error);
      return errorResponse(error.message || 'Failed to update settlement', 500);
    }
  })(request);
}

/**
 * DELETE /api/admin/settlements/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async () => {
    try {
      await prisma.settlement.delete({
        where: { id },
      });
      return successResponse({ id }, 'Settlement deleted successfully');
    } catch (error) {
      console.error('Delete settlement error:', error);
      return errorResponse('Failed to delete settlement', 500);
    }
  })(request);
}

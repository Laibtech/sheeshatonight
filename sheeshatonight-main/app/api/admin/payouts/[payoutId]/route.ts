import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

/**
 * POST /api/admin/payouts/[payoutId]
 * Update payout/settlement status (Admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ payoutId: string }> | { payoutId: string } }
) {
  const { payoutId } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { action } = body; // 'process', 'pay', 'fail'

      if (!payoutId || !action) {
        return errorResponse('Payout ID and action are required', 400);
      }

      const settlement = await prisma.settlement.findUnique({
        where: { id: payoutId },
      });

      if (!settlement) {
        return errorResponse('Payout settlement not found', 404);
      }

      let status: 'PENDING' | 'PROCESSED' | 'PAID' | 'FAILED' = 'PENDING';
      let paidAt: Date | null = settlement.paidAt;

      if (action === 'process') {
        status = 'PROCESSED';
      } else if (action === 'pay') {
        status = 'PAID';
        paidAt = new Date();
      } else if (action === 'fail') {
        status = 'FAILED';
      } else {
        return errorResponse('Invalid action', 400);
      }

      const updatedSettlement = await prisma.settlement.update({
        where: { id: payoutId },
        data: {
          status,
          paidAt,
        },
      });

      return successResponse(
        {
          settlement: {
            ...updatedSettlement,
            amount: Number(updatedSettlement.amount),
            commission: Number(updatedSettlement.commission),
          },
        },
        `Payout status updated to ${status}`,
        200
      );
    } catch (error) {
      console.error('Update payout status error:', error);
      return errorResponse('Failed to update payout status', 500);
    }
  })(request);
}

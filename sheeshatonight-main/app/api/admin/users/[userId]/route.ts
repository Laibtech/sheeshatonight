import { NextRequest, NextResponse } from 'next/server';
import { withAdmin, successResponse, errorResponse, AuthenticatedRequest } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/users/[userId]
 * Update user status or perform actions (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  const { userId } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { action } = body;

      if (!userId) {
        return errorResponse('User ID is required', 400);
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return errorResponse('User not found', 404);
      }

      let updatedUser;

      switch (action) {
        case 'activate':
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' },
          });
          break;

        case 'deactivate':
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { status: 'INACTIVE' },
          });
          break;

        case 'approve-kyc':
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              kycStatus: 'APPROVED',
              kycApprovedAt: new Date(),
              kycRejectedAt: null,
            },
          });
          break;

        case 'reject-kyc':
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              kycStatus: 'REJECTED',
              kycRejectedAt: new Date(),
              kycApprovedAt: null,
            },
          });
          break;

        case 'delete':
          // Soft delete by deactivating
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { status: 'INACTIVE' },
          });
          break;

        default:
          return errorResponse('Invalid action', 400);
      }

      return successResponse(
        { user: updatedUser },
        `User ${action}d successfully`,
        200
      );
    } catch (error) {
      console.error('Update user error:', error);
      return errorResponse('Failed to update user', 500);
    }
  })(request);
}

/**
 * GET /api/admin/users/[userId]
 * Get user details (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  const { userId } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          vendor: {
            include: {
              products: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  isActive: true,
                },
              },
            },
          },
          orders: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          addresses: true,
        },
      });

      if (!user) {
        return errorResponse('User not found', 404);
      }

      return successResponse({ user }, 200);
    } catch (error) {
      console.error('Get user error:', error);
      return errorResponse('Failed to fetch user', 500);
    }
  })(request);
}

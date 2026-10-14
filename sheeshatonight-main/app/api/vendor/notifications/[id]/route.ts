import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withVendor, errorResponse, successResponse, AuthenticatedRequest } from '@/lib/middleware';

/**
 * PATCH /api/vendor/notifications/[id]
 * Mark notification as read/unread
 * Uses EXISTING Notification table
 */
export const PATCH = withVendor(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const vendor = await prisma.vendor.findUnique({
      where: { id: req.user!.vendorId! },
      select: { userId: true },
    });

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    // Verify notification belongs to this vendor
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: vendor.userId,
      },
    });

    if (!notification) {
      return errorResponse('Notification not found or access denied', 404);
    }

    // Update read status
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: body.read !== undefined ? body.read : true },
    });

    return successResponse(updated, 'Notification updated successfully');
  } catch (error) {
    console.error('Vendor notification PATCH error:', error);
    return errorResponse('Failed to update notification', 500);
  }
});

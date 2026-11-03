import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { getPaginationParams } from '@/lib/utils';

/**
 * GET /api/admin/notifications
 * Get admin/system notifications from database with complete persistent counts (Admin only)
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip, take } = getPaginationParams(searchParams);
    const readParam = searchParams.get('read');
    const search = searchParams.get('search')?.trim();

    // Query filter for the list
    const where: any = {};
    if (readParam === 'true') where.read = true;
    if (readParam === 'false') where.read = false;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { message: { contains: search } },
        { type: { contains: search } },
      ];
    }

    // Execute queries in parallel:
    // 1. Filtered paginated items
    // 2. Count of items in the currently active filter/search
    // 3. COMPLETE database counts (independent of filter/page)
    const [notifications, totalFiltered, totalAll, totalUnread, totalRead] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.count({ where: { read: true } }),
    ]);

    const totalPages = Math.ceil(totalFiltered / pageSize) || 1;

    return NextResponse.json(
      {
        success: true,
        data: notifications,
        pagination: {
          total: totalFiltered,
          totalPages,
          currentPage: page,
          pageSize,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        counts: {
          all: totalAll,
          unread: totalUnread,
          read: totalRead,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin notifications error:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
});

/**
 * PUT /api/admin/notifications
 * Mark notification(s) as read or unread and return updated complete database counts
 */
export const PUT = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { id, readAll, read } = body;

    if (readAll) {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
    } else if (id) {
      const targetRead = typeof read === 'boolean' ? read : true;
      await prisma.notification.update({
        where: { id },
        data: { read: targetRead },
      });
    } else {
      return errorResponse('Notification ID or readAll flag is required', 400);
    }

    // Always fetch fresh authoritative counts from database
    const [totalAll, totalUnread, totalRead] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.count({ where: { read: true } }),
    ]);

    return NextResponse.json({
      success: true,
      message: readAll
        ? 'All notifications marked as read'
        : read === false
        ? 'Notification marked as unread'
        : 'Notification marked as read',
      counts: {
        all: totalAll,
        unread: totalUnread,
        read: totalRead,
      },
    });
  } catch (error) {
    console.error('Update notification error:', error);
    return errorResponse('Failed to update notification', 500);
  }
});

/**
 * DELETE /api/admin/notifications
 * Delete notification(s) and return updated complete database counts
 */
export const DELETE = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const deleteAllRead = searchParams.get('deleteAllRead') === 'true';

    if (deleteAllRead) {
      await prisma.notification.deleteMany({
        where: { read: true },
      });
    } else if (id) {
      await prisma.notification.delete({
        where: { id },
      });
    } else {
      return errorResponse('Notification ID or deleteAllRead flag is required', 400);
    }

    // Always fetch fresh authoritative counts from database
    const [totalAll, totalUnread, totalRead] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.count({ where: { read: true } }),
    ]);

    return NextResponse.json({
      success: true,
      message: deleteAllRead
        ? 'All read notifications deleted successfully'
        : 'Notification deleted successfully',
      counts: {
        all: totalAll,
        unread: totalUnread,
        read: totalRead,
      },
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse('Failed to delete notification', 500);
  }
});

/**
 * POST /api/admin/notifications
 * Broadcast or create database-backed notifications with target audience filtering
 * Supports: ALL, VENDORS, CUSTOMERS, ADMINS, or specific user/email
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { userId, targetEmail, targetRole, type, title, message, data } = body;

    const trimmedTitle = (title || '').trim();
    const trimmedMessage = (message || '').trim();

    if (!trimmedTitle || !trimmedMessage) {
      return errorResponse('Missing required fields: title and message are required', 400);
    }

    // 1. Duplicate Prevention: Check if exact announcement was dispatched within the last 2 minutes
    const recentDuplicate = await prisma.notification.findFirst({
      where: {
        title: trimmedTitle,
        message: trimmedMessage,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
    });

    if (recentDuplicate) {
      return errorResponse(
        'Duplicate announcement detected. A notification with this title and content was already sent within the last 2 minutes.',
        409
      );
    }

    // 2. Resolve Target User IDs based on Audience Role or Specific User
    let targetUserIds: string[] = [];

    if (targetEmail) {
      const targetUser = await prisma.user.findFirst({
        where: { email: targetEmail.trim().toLowerCase() },
        select: { id: true },
      });
      if (!targetUser) {
        return errorResponse(`Target user with email "${targetEmail}" was not found`, 404);
      }
      targetUserIds = [targetUser.id];
    } else if (userId) {
      targetUserIds = [userId];
    } else if (targetRole === 'VENDORS') {
      const vendorUsers = await prisma.user.findMany({
        where: { role: 'VENDOR' },
        select: { id: true },
      });
      targetUserIds = vendorUsers.map((u) => u.id);
    } else if (targetRole === 'CUSTOMERS') {
      const customerUsers = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: { id: true },
      });
      targetUserIds = customerUsers.map((u) => u.id);
    } else if (targetRole === 'ADMINS') {
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      targetUserIds = adminUsers.map((u) => u.id);
    } else {
      // Default: ALL marketplace users
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      });
      targetUserIds = allUsers.map((u) => u.id);
    }

    if (targetUserIds.length === 0) {
      return errorResponse('No recipient accounts matched the selected target audience', 400);
    }

    const broadcastPayload = {
      targetRole: targetRole || (targetEmail ? 'SPECIFIC' : 'ALL'),
      category: type || 'SYSTEM',
      sentAt: new Date().toISOString(),
      ...(data && typeof data === 'object' ? data : {}),
    };

    // 3. Batch insert notifications for all recipients in target audience
    const notificationEntries = targetUserIds.map((uid) => ({
      userId: uid,
      type: type || 'SYSTEM',
      title: trimmedTitle,
      message: trimmedMessage,
      read: false,
      data: JSON.stringify(broadcastPayload),
    }));

    await prisma.notification.createMany({
      data: notificationEntries,
    });

    // 4. Audit Log Entry for Real-Time Activity Monitoring
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.userId || targetUserIds[0] || 'system',
          action: 'BROADCAST_ANNOUNCEMENT',
          resourceType: 'NOTIFICATION',
          resourceId: `broadcast_${Date.now()}`,
          afterState: JSON.stringify({
            title: trimmedTitle,
            targetRole: broadcastPayload.targetRole,
            recipientsCount: targetUserIds.length,
          }),
        },
      });
    } catch {
      // Non-blocking audit log
    }

    // 5. Fresh authoritative database counts
    const [totalAll, totalUnread, totalRead] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.count({ where: { read: true } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Announcement broadcast successfully to ${targetUserIds.length} recipient${
          targetUserIds.length === 1 ? '' : 's'
        }`,
        recipientsCount: targetUserIds.length,
        counts: {
          all: totalAll,
          unread: totalUnread,
          read: totalRead,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notification error:', error);
    return errorResponse('Failed to create notification', 500);
  }
});

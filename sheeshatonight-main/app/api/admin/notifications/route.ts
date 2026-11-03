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
 * Create notification (Admin only) and return updated complete database counts
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { userId, type, title, message, data } = body;

    if (!userId || !title || !message) {
      return errorResponse('Missing required fields: userId, title, message', 400);
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type || 'SYSTEM',
        title,
        message,
        read: false,
        data: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null,
      },
    });

    // Always fetch fresh authoritative counts from database
    const [totalAll, totalUnread, totalRead] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.count({ where: { read: true } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Notification created successfully',
        data: { notification },
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

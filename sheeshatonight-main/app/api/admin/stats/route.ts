import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';

/**
 * GET /api/admin/stats
 * Get comprehensive admin statistics from actual MySQL database
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalCustomers,
      activeVendors,
      pendingVendors,
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
      pendingReviews,
      revenueData,
      recentOrders,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.vendor.count({ where: { isActive: true } }),
      prisma.vendor.count({ where: { isActive: false } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.order.count({ where: { status: 'READY_FOR_PICKUP' } }),
      prisma.order.count({ where: { status: 'OUT_FOR_DELIVERY' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          vendor: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.notification.count({ where: { read: false } }),
    ]);

    const totalRevenue = revenueData._sum.totalAmount
      ? Number(revenueData._sum.totalAmount)
      : 0;

    const statsPayload = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      activeVendors,
      totalVendors,
      totalUsers,
      pendingOrders,
      processingOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
      pendingVendors,
      lowStockProducts,
      lowStockCount: lowStockProducts,
      pendingReviews,
      activeProducts,
      unreadNotifications,
      averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
    };

    const formattedRecentOrders = recentOrders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
    }));

    return NextResponse.json(
      {
        success: true,
        data: statsPayload,
        stats: statsPayload,
        recentOrders: formattedRecentOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin stats from database' },
      { status: 500 }
    );
  }
});

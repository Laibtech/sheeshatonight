import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/middleware';
import { verifyTokenAndGetUser } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { orderActionSchema } from '@/lib/validation';
import { notifyOrderStatusChange, notifyLeaveReview } from '@/lib/notifications';

function extractTokenFromReq(request: Request): string | null {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookieHeader = request.headers.get('cookie');
  const match = cookieHeader?.match(/(?:^|; )auth_token=([^;]*)/);
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * GET /api/orders/[orderId]
 * Get order details
 */
export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> | { orderId: string } }) {
  try {
    const token = extractTokenFromReq(request);

    if (!token || !verifyToken(token)) {
      return errorResponse('Authentication required', 401);
    }

    const user = await verifyTokenAndGetUser(token);
    if (!user) {
      return errorResponse('User not found or inactive', 401);
    }

    const userId = user.id;
    const resolvedParams = await params;
    const orderId = resolvedParams.orderId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                type: true,
                price: true,
                images: true,
              },
            },
          },
        },
        tracking: true,
        invoice: true,
        vendor: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Check authorization - user owns order or is vendor or admin
    if (order.userId !== userId && user.role === 'CUSTOMER') {
      return errorResponse('Access denied', 403);
    }
    if (user.role === 'VENDOR' && order.vendorId !== user.vendor?.id) {
      return errorResponse('Access denied', 403);
    }

    return successResponse(order, 'Order retrieved successfully');
  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse('Failed to retrieve order', 500);
  }
}

/**
 * POST /api/orders/[orderId]
 * Update order status (vendor actions)
 */
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> | { orderId: string } }) {
  try {
    const token = extractTokenFromReq(request);

    if (!token || !verifyToken(token)) {
      return errorResponse('Authentication required', 401);
    }

    const user = await verifyTokenAndGetUser(token);
    if (!user) {
      return errorResponse('User not found or inactive', 401);
    }

    const userId = user.id;
    const resolvedParams = await params;
    const orderId = resolvedParams.orderId;

    const body = await request.json();
    const validation = orderActionSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('Validation failed', 400, 'VALIDATION_ERROR',
        Object.fromEntries(
          validation.error.errors.map(e => [e.path.join('.'), e.message])
        )
      );
    }

    // Fetch order and verify authorization
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Only vendor of this order or admin can update
    if (user.role === 'VENDOR' && order.vendorId !== user.vendor?.id) {
      return errorResponse('Access denied', 403);
    }
    if (user.role === 'CUSTOMER') {
      return errorResponse('Access denied', 403);
    }

    const { action } = validation.data;
    let updateData: any = {};

    switch (action) {
      case 'accept':
        if (order.status !== 'PREPARING') {
          return errorResponse('Order is not in PREPARING state', 400);
        }
        updateData = { status: 'READY_FOR_PICKUP', acceptedAt: new Date() };
        break;

      case 'decline':
        if (order.status !== 'PREPARING') {
          return errorResponse('Order is not in PREPARING state', 400);
        }
        updateData = { status: 'CANCELLED', cancelledAt: new Date(), payoutStatus: 'FAILED' };
        // Restock inventory
        try {
          const itemsToRestock = await prisma.orderItem.findMany({ where: { orderId } });
          for (const it of itemsToRestock) {
            await prisma.product.update({
              where: { id: it.productId },
              data: { stock: { increment: it.quantity } },
            });
          }
        } catch (restockErr) {
          console.error('Failed to restock cancelled items:', restockErr);
        }
        break;

      case 'ship':
        if (order.status !== 'READY_FOR_PICKUP') {
          return errorResponse('Order is not ready for pickup', 400);
        }
        updateData = { status: 'OUT_FOR_DELIVERY', shippedAt: new Date() };
        break;

      case 'deliver':
        if (!['OUT_FOR_DELIVERY', 'ACTIVE_RENTAL'].includes(order.status)) {
          return errorResponse('Order cannot be delivered in current state', 400);
        }
        updateData = { status: 'DELIVERED', deliveredAt: new Date(), payoutStatus: 'ELIGIBLE' };
        break;

      case 'cancel':
        if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
          return errorResponse('Cannot cancel order in current state', 400);
        }
        updateData = { status: 'CANCELLED', cancelledAt: new Date(), payoutStatus: 'FAILED' };
        // Restock inventory
        try {
          const itemsToRestock = await prisma.orderItem.findMany({ where: { orderId } });
          for (const it of itemsToRestock) {
            await prisma.product.update({
              where: { id: it.productId },
              data: { stock: { increment: it.quantity } },
            });
          }
        } catch (restockErr) {
          console.error('Failed to restock cancelled items:', restockErr);
        }
        break;

      default:
        return errorResponse('Invalid action', 400);
    }

    const result = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Send notification to customer about status change
    await notifyOrderStatusChange(orderId, result.status);

    // If delivered, also send review request after a delay
    if (result.status === 'DELIVERED' || result.status === 'COMPLETED') {
      // In production, this would be a scheduled job
      setTimeout(() => {
        notifyLeaveReview(orderId);
      }, 24 * 60 * 60 * 1000); // 24 hours later
    }

    return successResponse(result, `Order ${action}ed successfully`);
  } catch (error) {
    console.error('Order action error:', error);
    return errorResponse('Failed to update order', 500);
  }
}

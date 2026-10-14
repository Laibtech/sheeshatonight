import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

/**
 * GET /api/admin/orders/[orderId]
 * Get complete order details (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  const resolvedParams = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const { orderId } = resolvedParams;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              addresses: true,
            },
          },
          vendor: {
            select: {
              id: true,
              name: true,
              slug: true,
              phone: true,
              location: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  sku: true,
                  images: true,
                },
              },
            },
          },
          invoice: true,
          tracking: true,
        },
      });

      if (!order) {
        return errorResponse('Order not found', 404);
      }

      const gross = Number(order.totalAmount || 0);
      const fee = Number(order.platformFee || 0);
      const net = Number(order.vendorNet || (gross - fee));

      const formattedOrder = {
        ...order,
        totalAmount: gross,
        subtotal: Number(order.subtotal || gross),
        platformFee: fee,
        vendorNet: net,
        commissionRate: Number(order.commissionRate || 10),
        payoutStatus: order.payoutStatus || 'PENDING',
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
          product: {
            ...item.product,
            price: Number(item.product.price),
          },
        })),
        invoice: order.invoice
          ? {
              ...order.invoice,
              subtotal: Number(order.invoice.subtotal),
              tax: Number(order.invoice.tax),
              total: Number(order.invoice.total),
            }
          : null,
      };

      return successResponse({ order: formattedOrder }, 200);
    } catch (error) {
      console.error('Get order error:', error);
      return errorResponse('Failed to fetch order', 500);
    }
  })(request);
}

/**
 * PUT or POST /api/admin/orders/[orderId]
 * Update order status and log tracking (Admin only)
 */
async function handleUpdateStatus(
  request: NextRequest,
  params: Promise<{ orderId: string }> | { orderId: string }
) {
  const resolvedParams = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const { orderId } = resolvedParams;
      const body = await req.json();
      const { status, payoutStatus, trackingNote } = body;

      if (!orderId || (!status && !payoutStatus)) {
        return errorResponse('Order ID and status or payoutStatus are required', 400);
      }

      let targetPayoutStatus = payoutStatus;
      if (!targetPayoutStatus && status) {
        if (status === 'DELIVERED' || status === 'COMPLETED') {
          targetPayoutStatus = 'ELIGIBLE';
        } else if (status === 'CANCELLED') {
          targetPayoutStatus = 'FAILED';
        }
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          ...(status ? { status } : {}),
          ...(targetPayoutStatus ? { payoutStatus: targetPayoutStatus } : {}),
          ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
          ...(status === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
          updatedAt: new Date(),
        },
      });

      // Update or create tracking entry
      await prisma.orderTracking.upsert({
        where: { orderId },
        create: {
          orderId,
          status,
          events: [
            {
              status,
              note: trackingNote || `Order status updated to ${status} by admin`,
              timestamp: new Date().toISOString(),
            },
          ],
        },
        update: {
          status,
          lastUpdated: new Date(),
        },
      });

      // Create audit log
      if (req.user?.userId) {
        await prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            action: 'UPDATE_ORDER_STATUS',
            resourceType: 'Order',
            resourceId: orderId,
            afterState: JSON.stringify({ status }),
          },
        });
      }

      return successResponse(
        {
          order: {
            ...updatedOrder,
            totalAmount: Number(updatedOrder.totalAmount),
          },
        },
        'Order status updated successfully',
        200
      );
    } catch (error) {
      console.error('Update order status error:', error);
      return errorResponse('Failed to update order status', 500);
    }
  })(request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  return handleUpdateStatus(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  return handleUpdateStatus(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  return handleUpdateStatus(request, params);
}

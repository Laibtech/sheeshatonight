import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

/**
 * GET /api/admin/customers/[id]
 * Get customer profile, addresses, orders, wishlist, and reviews (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async () => {
    try {
      const customer = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          verified: true,
          kycStatus: true,
          kycApprovedAt: true,
          locale: true,
          createdAt: true,
          addresses: true,
          orders: {
            orderBy: { createdAt: 'desc' },
            include: {
              vendor: { select: { name: true } },
              _count: { select: { items: true } },
            },
          },
          wishlistItems: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      if (!customer) {
        return errorResponse('Customer not found', 404);
      }

      // Fetch reviews submitted by this user
      const reviews = await prisma.review.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
      });

      const totalSpent = customer.orders.reduce(
        (sum, ord) => (ord.status !== 'CANCELLED' ? sum + Number(ord.totalAmount) : sum),
        0
      );

      const formattedOrders = customer.orders.map((ord) => ({
        ...ord,
        totalAmount: Number(ord.totalAmount),
      }));

      const formattedWishlist = customer.wishlistItems.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              price: Number(item.product.price),
            }
          : null,
      }));

      return successResponse({
        customer: {
          ...customer,
          orders: formattedOrders,
          wishlistItems: formattedWishlist,
          reviews,
          totalSpent: Math.round(totalSpent * 100) / 100,
        },
      });
    } catch (error) {
      console.error('Get customer details error:', error);
      return errorResponse('Failed to fetch customer details', 500);
    }
  })(request);
}

/**
 * PUT /api/admin/customers/[id]
 * Update customer status or KYC (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { status, kycStatus, verified } = body;

      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(status ? { status } : {}),
          ...(kycStatus ? { kycStatus } : {}),
          ...(verified !== undefined ? { verified: Boolean(verified) } : {}),
        },
      });

      return successResponse({ customer: updated }, 'Customer updated successfully');
    } catch (error: any) {
      console.error('Update customer error:', error);
      return errorResponse(error.message || 'Failed to update customer', 500);
    }
  })(request);
}

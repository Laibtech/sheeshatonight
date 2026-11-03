import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, errorResponse, successResponse, AuthenticatedRequest } from '@/lib/middleware';
import { VendorTier } from '@prisma/client';

/**
 * GET /api/admin/vendors/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async () => {
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              kycStatus: true,
              status: true,
              createdAt: true,
            },
          },
          documents: true,
          products: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              type: true,
              isActive: true,
            },
          },
          orders: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true,
              createdAt: true,
              user: { select: { name: true, email: true } },
            },
          },
          settlements: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!vendor) {
        return errorResponse('Vendor not found', 404);
      }

      const totalRevenue = vendor.orders.reduce(
        (sum, ord) => (ord.status !== 'CANCELLED' ? sum + Number(ord.totalAmount) : sum),
        0
      );

      return successResponse({
        vendor: {
          ...vendor,
          products: vendor.products.map((p) => ({
            ...p,
            price: Number(p.price),
          })),
          orders: vendor.orders.map((o) => ({
            ...o,
            totalAmount: Number(o.totalAmount),
          })),
          settlements: vendor.settlements.map((s) => ({
            ...s,
            amount: Number(s.amount),
            commission: Number(s.commission),
          })),
          totalRevenue: Math.round(totalRevenue * 100) / 100,
        },
      });
    } catch (error) {
      console.error('Get vendor detail error:', error);
      return errorResponse('Failed to fetch vendor details', 500);
    }
  })(request);
}

/**
 * PUT /api/admin/vendors/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { name, tier, isActive, description, location, phone } = body;

      const updated = await prisma.vendor.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(tier ? { tier: tier as VendorTier } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(location !== undefined ? { location } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
      });

      return successResponse({ vendor: updated }, 'Vendor updated successfully');
    } catch (error: any) {
      console.error('Update vendor error:', error);
      return errorResponse(error.message || 'Failed to update vendor', 500);
    }
  })(request);
}

/**
 * POST /api/admin/vendors/[id]
 * Handle vendor actions: approve, reject, activate, deactivate, delete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const action = body.action;

      if (!id || !action) {
        return errorResponse('Missing required fields: id, action', 400);
      }

      const vendor = await prisma.vendor.findUnique({
        where: { id },
      });

      if (!vendor) {
        return errorResponse('Vendor not found', 404);
      }

      let updatedVendor;
      switch (action) {
        case 'approve':
        case 'activate':
          updatedVendor = await prisma.vendor.update({
            where: { id },
            data: { isActive: true },
          });
          if (vendor.userId) {
            await prisma.user.update({
              where: { id: vendor.userId },
              data: { kycStatus: 'APPROVED', verified: true },
            });
            await prisma.notification.create({
              data: {
                userId: vendor.userId,
                type: 'SYSTEM',
                title: 'Vendor Store Approved 🎉',
                message: 'Your SheeshaTonight vendor application has been approved by admin. You can now access your full vendor dashboard, list products, and manage orders.',
                read: false,
              },
            });
          }
          await prisma.auditLog.create({
            data: {
              userId: req.user?.userId || vendor.userId || 'system',
              action: 'APPROVE_VENDOR',
              resourceType: 'VENDOR',
              resourceId: id,
              afterState: JSON.stringify({ vendorId: id, isActive: true, kycStatus: 'APPROVED' }),
            },
          });
          break;

        case 'reject':
        case 'deactivate':
          updatedVendor = await prisma.vendor.update({
            where: { id },
            data: { isActive: false },
          });
          if (vendor.userId) {
            await prisma.user.update({
              where: { id: vendor.userId },
              data: { kycStatus: 'REJECTED' },
            });
            await prisma.notification.create({
              data: {
                userId: vendor.userId,
                type: 'ALERT',
                title: 'Vendor Application Update',
                message: body.reason || 'Your vendor application was reviewed and could not be approved at this time. Please update your business documentation and resubmit.',
                read: false,
              },
            });
          }
          await prisma.auditLog.create({
            data: {
              userId: req.user?.userId || vendor.userId || 'system',
              action: 'REJECT_VENDOR',
              resourceType: 'VENDOR',
              resourceId: id,
              afterState: JSON.stringify({ vendorId: id, isActive: false, kycStatus: 'REJECTED', reason: body.reason }),
            },
          });
          break;

        case 'request_info':
          if (vendor.userId) {
            await prisma.notification.create({
              data: {
                userId: vendor.userId,
                type: 'ALERT',
                title: 'Additional Information Required for Vendor Application',
                message: body.reason || 'Administration requires additional information or updated trade license documentation to complete your store approval.',
                read: false,
              },
            });
          }
          await prisma.auditLog.create({
            data: {
              userId: req.user?.userId || vendor.userId || 'system',
              action: 'REQUEST_INFO_VENDOR',
              resourceType: 'VENDOR',
              resourceId: id,
              afterState: JSON.stringify({ vendorId: id, requestedInfo: body.reason }),
            },
          });
          return successResponse({ vendor }, 'Information request sent to vendor successfully');

        case 'delete': {
          const force = Boolean(body.force);
          const result = await deleteVendorRecord(id, force, req.user?.userId || 'admin');
          if (!result.success) {
            return NextResponse.json(result, { status: result.status || 400 });
          }
          return successResponse(result.data, result.message);
        }

        default:
          return errorResponse(`Unknown action: ${action}`, 400);
      }

      return successResponse({ vendor: updatedVendor }, `Vendor ${action}d successfully`);
    } catch (error: any) {
      console.error('Vendor action error:', error);
      return errorResponse(error.message || 'Failed to perform vendor action', 500);
    }
  })(request);
}

/**
 * DELETE /api/admin/vendors/[id]
 * Permanently delete or cascade delete a vendor store
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const force = searchParams.get('force') === 'true';

      const result = await deleteVendorRecord(id, force, req.user?.userId || 'admin');

      if (!result.success) {
        return NextResponse.json(result, { status: result.status || 400 });
      }

      return successResponse(result.data, result.message);
    } catch (error: any) {
      console.error('Delete vendor error:', error);
      return errorResponse(error.message || 'Failed to delete vendor', 500);
    }
  })(request);
}

/**
 * Helper to delete a vendor and clean up related records safely
 */
async function deleteVendorRecord(id: string, force: boolean, adminUserId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      user: true,
      orders: { select: { id: true, orderNumber: true } },
      products: { select: { id: true } },
      documents: { select: { id: true } },
      settlements: { select: { id: true } },
    },
  });

  if (!vendor) {
    return { success: false, error: 'Vendor not found', status: 404 };
  }

  const orderIds = vendor.orders.map((o) => o.id);
  const productIds = vendor.products.map((p) => p.id);

  if (orderIds.length > 0 && !force) {
    return {
      success: false,
      error: `Vendor "${vendor.name}" has ${orderIds.length} existing order(s). Pass force=true to delete with historical orders.`,
      status: 400,
      requiresForce: true,
      ordersCount: orderIds.length,
      vendorName: vendor.name,
    };
  }

  // 1. If force and orders exist, clean up order dependencies
  if (orderIds.length > 0) {
    await prisma.invoice.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.orderTracking.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  }

  // 2. Clean up product dependencies (Cart, Wishlist, OrderItems)
  if (productIds.length > 0) {
    await prisma.cart.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.wishlist.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.product.deleteMany({ where: { vendorId: id } });
  }

  // 3. Clean up documents and settlements
  await prisma.vendorDocument.deleteMany({ where: { vendorId: id } });
  await prisma.settlement.deleteMany({ where: { vendorId: id } });

  // 4. Delete the Vendor record
  await prisma.vendor.delete({ where: { id } });

  // 5. Update user: demote role to CUSTOMER, reset kycStatus
  if (vendor.userId) {
    await prisma.user.update({
      where: { id: vendor.userId },
      data: { role: 'CUSTOMER', kycStatus: 'REJECTED' },
    });
  }

  // 6. Record Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUserId || 'admin',
      action: 'DELETE_VENDOR',
      resourceType: 'VENDOR',
      resourceId: id,
      afterState: JSON.stringify({
        deletedVendorName: vendor.name,
        deletedVendorSlug: vendor.slug,
        ownerEmail: vendor.user?.email,
        ordersRemoved: orderIds.length,
        productsRemoved: productIds.length,
      }),
    },
  });

  return {
    success: true,
    message: `Vendor "${vendor.name}" has been permanently deleted successfully.`,
    data: { id, name: vendor.name },
  };
}

export const PATCH = PUT;

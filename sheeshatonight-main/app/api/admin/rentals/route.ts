import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { getPaginationParams, buildPaginationResponse } from '@/lib/utils';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/rentals
 * List rental package listings with vendor, pricing, equipment and availability
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip, take } = getPaginationParams(searchParams);
    const search = searchParams.get('search')?.trim();
    const vendorId = searchParams.get('vendorId')?.trim();
    const isActive = searchParams.get('isActive')?.trim();
    const isFeatured = searchParams.get('isFeatured')?.trim();

    const where: any = {
      type: 'RENTAL_PACKAGE',
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { equipmentDetails: { contains: search } },
        { vendor: { name: { contains: search } } },
      ];
    }

    if (vendorId && vendorId !== 'ALL') {
      where.vendorId = vendorId;
    }

    if (isActive && isActive !== 'ALL') {
      where.isActive = isActive === 'true';
    }

    if (isFeatured && isFeatured !== 'ALL') {
      where.isFeatured = isFeatured === 'true';
    }

    const [rentals, total, activeBookingsCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              slug: true,
              tier: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
      prisma.order.count({
        where: {
          status: 'ACTIVE_RENTAL',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: rentals,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      activeBookingsCount,
    });
  } catch (error: any) {
    console.error('Admin Rentals GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch rental listings', 500);
  }
});

/**
 * POST /api/admin/rentals
 * Create a new rental package listing
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const {
      title,
      description,
      vendorId,
      price,
      rentalHourlyPrice,
      rentalDurationHours,
      securityDeposit = 0,
      deliveryCharge = 0,
      equipmentDetails,
      accessoriesIncluded,
      rentalTerms,
      stock = 5,
      images = [],
      sku,
      isActive = true,
      isFeatured = false,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !vendorId || price === undefined) {
      return errorResponse('Title, vendor assignment, and daily rental price are required', 400);
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return errorResponse('Assigned vendor does not exist', 404);
    }

    const rental = await prisma.product.create({
      data: {
        title: title.trim(),
        description: description || null,
        vendorId,
        type: 'RENTAL_PACKAGE',
        price: Number(price),
        currency: 'AED',
        rentalHourlyPrice: rentalHourlyPrice ? Number(rentalHourlyPrice) : null,
        rentalDurationHours: rentalDurationHours ? Number(rentalDurationHours) : null,
        securityDeposit: securityDeposit ? Number(securityDeposit) : null,
        deliveryCharge: deliveryCharge ? Number(deliveryCharge) : null,
        equipmentDetails: equipmentDetails || null,
        accessoriesIncluded: accessoriesIncluded || null,
        rentalTerms: rentalTerms || null,
        stock: Number(stock) || 1,
        images: Array.isArray(images) ? JSON.stringify(images) : images || null,
        sku: sku || `RNT-${Date.now().toString().slice(-6)}`,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        approvedAt: new Date(),
      },
      include: {
        vendor: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'CREATE_RENTAL_LISTING',
      resourceType: 'RENTAL',
      resourceId: rental.id,
      afterState: { title: rental.title, price: rental.price, vendor: rental.vendor.name },
    });

    return successResponse(rental, 'Rental package listing created successfully in MySQL', 201);
  } catch (error: any) {
    console.error('Admin Rentals POST Error:', error);
    return errorResponse(error.message || 'Failed to create rental listing', 500);
  }
});


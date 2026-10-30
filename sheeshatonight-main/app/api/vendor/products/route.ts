import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withVendor, errorResponse, successResponse, AuthenticatedRequest } from '@/lib/middleware';
import { createProductSchema } from '@/lib/validation';
import { getPaginationParams, buildPaginationResponse } from '@/lib/utils';

export const GET = withVendor(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const { skip, take, page, pageSize } = getPaginationParams(searchParams);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const sort = searchParams.get('sort') || '-createdAt';

    const where: any = { vendorId: req.user!.vendorId };
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (!searchParams.get('includeDeleted')) where.deletedAt = null;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sort.replace('-', '')]: sort.startsWith('-') ? 'desc' : 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          price: true,
          currency: true,
          stock: true,
          images: true,
          sku: true,
          isActive: true,
          isFeatured: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return successResponse(buildPaginationResponse(products, total, page, pageSize));
  } catch (error) {
    console.error('Vendor products GET error:', error);
    return errorResponse('Failed to fetch products', 500);
  }
});

export const POST = withVendor(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      const errorMap = Object.fromEntries(
        validation.error.errors.map(e => [e.path.join('.'), e.message])
      );
      const readableErrors = Object.entries(errorMap).map(([field, msg]) => `${field}: ${msg}`).join(', ');
      return errorResponse(`Validation failed: ${readableErrors}`, 400, 'VALIDATION_ERROR', errorMap);
    }

    // Verify vendor is active and approved by admin
    const vendorRecord = await prisma.vendor.findUnique({
      where: { id: req.user!.vendorId! },
      select: { isActive: true },
    });

    if (!vendorRecord || !vendorRecord.isActive) {
      return errorResponse('Forbidden: Your vendor store is pending admin approval or currently inactive', 403);
    }

    const product = await prisma.product.create({
      data: {
        ...validation.data,
        vendorId: req.user!.vendorId!,
        images: validation.data.images || [],
      },
    });

    return successResponse(product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Vendor products POST error:', error);
    return errorResponse('Failed to create product', 500);
  }
});

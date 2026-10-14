import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { ProductType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async () => {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!product) {
        return errorResponse('Product not found', 404);
      }

      return successResponse({
        product: {
          ...product,
          price: Number(product.price),
        },
      });
    } catch (error) {
      console.error('Get product error:', error);
      return errorResponse('Failed to fetch product', 500);
    }
  })(request);
}

/**
 * PUT /api/admin/products/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const {
        title,
        description,
        type,
        price,
        currency,
        stock,
        sku,
        vendorId,
        images,
        isActive,
        isFeatured,
      } = body;

      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(title ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(type ? { type: type as ProductType } : {}),
          ...(price !== undefined ? { price: Number(price) } : {}),
          ...(currency ? { currency } : {}),
          ...(stock !== undefined ? { stock: Number(stock) } : {}),
          ...(sku ? { sku } : {}),
          ...(vendorId ? { vendorId } : {}),
          ...(images !== undefined ? { images: Array.isArray(images) ? images : [images] } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
          ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
        },
      });

      return successResponse({
        product: {
          ...updated,
          price: Number(updated.price),
        },
      }, 'Product updated successfully');
    } catch (error: any) {
      console.error('Update product error:', error);
      return errorResponse(error.message || 'Failed to update product', 500);
    }
  })(request);
}

/**
 * POST /api/admin/products/[id]
 * Action based product status update (activate, deactivate, approve, reject)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { action } = body;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return errorResponse('Product not found', 404);
      }

      let updatedProduct;
      switch (action) {
        case 'activate':
        case 'approve':
          updatedProduct = await prisma.product.update({
            where: { id },
            data: { isActive: true },
          });
          break;

        case 'deactivate':
        case 'reject':
          updatedProduct = await prisma.product.update({
            where: { id },
            data: { isActive: false },
          });
          break;

        default:
          return errorResponse('Invalid action', 400);
      }

      return successResponse(
        {
          product: {
            ...updatedProduct,
            price: Number(updatedProduct.price),
          },
        },
        `Product ${action}d successfully`,
        200
      );
    } catch (error) {
      console.error('Update product action error:', error);
      return errorResponse('Failed to update product', 500);
    }
  })(request);
}

/**
 * PATCH /api/admin/products/[id]
 * Partial update product fields (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return errorResponse('Product not found', 404);
      }

      const updateData: any = {};
      if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
      if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.price !== undefined) updateData.price = parseFloat(body.price);
      if (body.stock !== undefined) updateData.stock = parseInt(body.stock, 10);
      if (body.type !== undefined) updateData.type = body.type;
      if (body.sku !== undefined) updateData.sku = body.sku;
      if (body.images !== undefined) {
        updateData.images = Array.isArray(body.images) ? body.images : [body.images];
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      return successResponse(
        {
          product: {
            ...updated,
            price: Number(updated.price),
          },
        },
        'Product updated successfully',
        200
      );
    } catch (error) {
      console.error('PATCH admin product error:', error);
      return errorResponse('Failed to update product', 500);
    }
  })(request);
}

/**
 * DELETE /api/admin/products/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async () => {
    try {
      // First attempt hard delete
      await prisma.product.delete({
        where: { id },
      });
      return successResponse({ id }, 'Product permanently deleted');
    } catch (error: any) {
      // If product has references in orders/cart/reviews, safely soft-delete
      try {
        await prisma.product.update({
          where: { id },
          data: {
            deletedAt: new Date(),
            isActive: false,
          },
        });
        return successResponse({ id }, 'Product deleted and removed from catalogue');
      } catch (softErr: any) {
        console.error('Delete product error:', softErr);
        return errorResponse('Failed to delete product', 500);
      }
    }
  })(request);
}

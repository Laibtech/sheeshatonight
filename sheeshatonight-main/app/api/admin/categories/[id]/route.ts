import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/categories/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async () => {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        return errorResponse('Category not found', 404);
      }

      return successResponse({ category });
    } catch (error: any) {
      console.error('Get category error:', error);
      return errorResponse(error.message || 'Failed to fetch category', 500);
    }
  })(request);
}

/**
 * PUT /api/admin/categories/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { name, slug, description, image, isActive, isFeatured, sortOrder } = body;

      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(slug ? { slug } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(image !== undefined ? { image } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
          ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
          ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
        },
      });

      return successResponse({ category: updated }, 'Category updated successfully');
    } catch (error: any) {
      console.error('Update category error:', error);
      return errorResponse(error.message || 'Failed to update category', 500);
    }
  })(request);
}

/**
 * DELETE /api/admin/categories/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await params;
  return withAdmin(async () => {
    try {
      await prisma.category.delete({
        where: { id },
      });
      return successResponse({ id }, 'Category deleted successfully');
    } catch (error) {
      console.error('Delete category error:', error);
      return errorResponse('Failed to delete category', 500);
    }
  })(request);
}

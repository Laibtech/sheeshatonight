import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

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
      const {
        name,
        slug,
        description,
        image,
        icon,
        parentId,
        isActive,
        isFeatured,
        sortOrder,
        seoTitle,
        seoDescription,
      } = body;

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) {
        return errorResponse('Category not found', 404);
      }

      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(slug ? { slug: slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(image !== undefined ? { image } : {}),
          ...(icon !== undefined ? { icon } : {}),
          ...(parentId !== undefined ? { parentId } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
          ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
          ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
          ...(seoTitle !== undefined ? { seoTitle } : {}),
          ...(seoDescription !== undefined ? { seoDescription } : {}),
        },
      });

      await logAdminAction({
        userId: req.user?.userId,
        action: 'UPDATE_CATEGORY',
        resourceType: 'CATEGORY',
        resourceId: id,
        beforeState: existing,
        afterState: updated,
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
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) {
        return errorResponse('Category not found', 404);
      }

      await prisma.category.delete({
        where: { id },
      });

      await logAdminAction({
        userId: req.user?.userId,
        action: 'DELETE_CATEGORY',
        resourceType: 'CATEGORY',
        resourceId: id,
        beforeState: existing,
      });

      return successResponse({ id }, 'Category deleted successfully');
    } catch (error: any) {
      console.error('Delete category error:', error);
      return errorResponse(error.message || 'Failed to delete category', 500);
    }
  })(request);
}

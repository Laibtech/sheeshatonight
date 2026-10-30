import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/categories
 * List all categories from the real Category table (Admin only)
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse({ categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
});

/**
 * POST /api/admin/categories
 * Create a new category in the Category table (Admin only)
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      description,
      image,
      icon,
      parentId,
      isActive = true,
      isFeatured = false,
      sortOrder = 0,
      seoTitle,
      seoDescription,
    } = body;

    if (!name) {
      return errorResponse('Category name is required', 400);
    }

    const categorySlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: categorySlug,
        description: description || null,
        image: image || null,
        icon: icon || null,
        parentId: parentId || null,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        sortOrder: Number(sortOrder) || 0,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'CREATE_CATEGORY',
      resourceType: 'CATEGORY',
      resourceId: category.id,
      afterState: { name: category.name, slug: category.slug },
    });

    return successResponse({ category }, 'Category created successfully in MySQL', 201);
  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      return errorResponse('Category with this name or slug already exists', 409);
    }
    return errorResponse(error.message || 'Failed to create category', 500);
  }
});

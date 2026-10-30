import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

// GET: List all pages with optional search, status filtering, and sorting
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim().toLowerCase(); // 'all', 'published', 'draft'
    const sort = searchParams.get('sort') || 'updatedAt'; // 'updatedAt', 'title', 'createdAt'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (status === 'published') {
      where.isActive = true;
    } else if (status === 'draft') {
      where.isActive = false;
    }

    const pages = await prisma.cmsPage.findMany({
      where,
      orderBy: { [sort]: order },
    });

    return successResponse(pages, 'CMS pages fetched successfully');
  } catch (error: any) {
    console.error('CMS Pages GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch pages', 500);
  }
});

// POST: Create new page
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { title, slug, content, seoTitle, seoDescription, ogImage, canonicalUrl, isActive = true } = body;

    if (!title) {
      return errorResponse('Page title is required', 400);
    }

    const finalSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const page = await prisma.cmsPage.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        content: content || '',
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        ogImage: ogImage || null,
        canonicalUrl: canonicalUrl || null,
        isActive: Boolean(isActive),
      },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'CREATE_CMS_PAGE',
      resourceType: 'CMS_PAGE',
      resourceId: page.id,
      afterState: { title: page.title, slug: page.slug },
    });

    return successResponse(page, 'Page created successfully', 201);
  } catch (error: any) {
    console.error('CMS Page POST Error:', error);
    if (error.code === 'P2002') {
      return errorResponse('A page with this slug already exists', 409);
    }
    return errorResponse(error.message || 'Failed to create page', 500);
  }
});

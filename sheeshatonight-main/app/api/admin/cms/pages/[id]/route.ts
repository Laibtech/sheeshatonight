import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

// PATCH: Update page
export const PATCH = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.cmsPage.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Page not found', 404);
    }

    const data: any = { ...body };
    if (data.slug) {
      data.slug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (data.isActive !== undefined) {
      data.isActive = Boolean(data.isActive);
    }

    const page = await prisma.cmsPage.update({
      where: { id },
      data,
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'UPDATE_CMS_PAGE',
      resourceType: 'CMS_PAGE',
      resourceId: id,
      beforeState: existing,
      afterState: page,
    });

    return successResponse(page, 'Page updated successfully');
  } catch (error: any) {
    console.error('CMS Page PATCH Error:', error);
    if (error.code === 'P2002') {
      return errorResponse('A page with this slug already exists', 409);
    }
    return errorResponse(error.message || 'Failed to update page', 500);
  }
});

// DELETE: Delete page
export const DELETE = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;

    const existing = await prisma.cmsPage.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Page not found', 404);
    }

    await prisma.cmsPage.delete({
      where: { id },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'DELETE_CMS_PAGE',
      resourceType: 'CMS_PAGE',
      resourceId: id,
      beforeState: existing,
    });

    return successResponse(null, 'Page deleted successfully');
  } catch (error: any) {
    console.error('CMS Page DELETE Error:', error);
    return errorResponse(error.message || 'Failed to delete page', 500);
  }
});

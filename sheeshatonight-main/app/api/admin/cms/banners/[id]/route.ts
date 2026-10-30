import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

// PATCH: Update banner
export const PATCH = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.cmsBanner.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Banner not found', 404);
    }

    const data: any = { ...body };
    if (data.startDate !== undefined) {
      data.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      data.endDate = data.endDate ? new Date(data.endDate) : null;
    }
    if (data.sortOrder !== undefined) {
      data.sortOrder = Number(data.sortOrder) || 0;
    }
    if (data.isActive !== undefined) {
      data.isActive = Boolean(data.isActive);
    }

    const banner = await prisma.cmsBanner.update({
      where: { id },
      data,
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'UPDATE_BANNER',
      resourceType: 'CMS_BANNER',
      resourceId: id,
      beforeState: existing,
      afterState: banner,
    });

    return successResponse(banner, 'Banner updated successfully');
  } catch (error: any) {
    console.error('CMS Banner PATCH Error:', error);
    return errorResponse(error.message || 'Failed to update banner', 500);
  }
});

// DELETE: Delete banner by ID
export const DELETE = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;

    const existing = await prisma.cmsBanner.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Banner not found', 404);
    }

    await prisma.cmsBanner.delete({
      where: { id },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'DELETE_BANNER',
      resourceType: 'CMS_BANNER',
      resourceId: id,
      beforeState: existing,
    });

    return successResponse(null, 'Banner deleted successfully');
  } catch (error: any) {
    console.error('CMS Banner DELETE Error:', error);
    return errorResponse(error.message || 'Failed to delete banner', 500);
  }
});

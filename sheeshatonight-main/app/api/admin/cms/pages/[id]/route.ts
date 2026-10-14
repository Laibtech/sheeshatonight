import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

// PATCH: Update page
export const PATCH = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const page = await prisma.cmsPage.update({
      where: { id },
      data: body,
    });

    return successResponse(page, 'Page updated successfully');
  } catch (error: any) {
    console.error('CMS Page PATCH Error:', error);
    return errorResponse(error.message || 'Failed to update page', 500);
  }
});

// DELETE: Delete page
export const DELETE = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;

    await prisma.cmsPage.delete({
      where: { id },
    });

    return successResponse(null, 'Page deleted successfully');
  } catch (error: any) {
    console.error('CMS Page DELETE Error:', error);
    return errorResponse(error.message || 'Failed to delete page', 500);
  }
});

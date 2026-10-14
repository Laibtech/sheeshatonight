import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

// PATCH: Update banner
export const PATCH = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const banner = await prisma.cmsBanner.update({
      where: { id },
      data: body,
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

    await prisma.cmsBanner.delete({
      where: { id },
    });

    return successResponse(null, 'Banner deleted successfully');
  } catch (error: any) {
    console.error('CMS Banner DELETE Error:', error);
    return errorResponse(error.message || 'Failed to delete banner', 500);
  }
});


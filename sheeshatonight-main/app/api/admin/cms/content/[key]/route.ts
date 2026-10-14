import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';

// GET: Fetch CMS content by key
export const GET = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ key: string }> | { key: string } }) => {
  try {
    const { key } = await params;
    const content = await prisma.cmsContent.findUnique({
      where: { key },
    });

    return successResponse(content ? content.value : null);
  } catch (error: any) {
    console.error('CMS Content GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch CMS content', 500);
  }
});

// POST: Upsert CMS content by key
export const POST = withAdmin(async (req: AuthenticatedRequest, { params }: { params: Promise<{ key: string }> | { key: string } }) => {
  try {
    const { key } = await params;
    const body = await req.json();

    const content = await prisma.cmsContent.upsert({
      where: { key },
      create: {
        key,
        value: body,
      },
      update: {
        value: body,
      },
    });

    return successResponse(content, 'CMS content updated successfully');
  } catch (error: any) {
    console.error('CMS Content POST Error:', error);
    return errorResponse(error.message || 'Failed to update CMS content', 500);
  }
});


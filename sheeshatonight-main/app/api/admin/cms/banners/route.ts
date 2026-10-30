import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

// GET: List all banners
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const banners = await prisma.cmsBanner.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return successResponse({ banners, data: banners });
  } catch (error: any) {
    console.error('CMS Banners GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch banners', 500);
  }
});

// POST: Create new banner
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const {
      heading,
      subtitle,
      ctaText,
      ctaUrl,
      desktopImg,
      mobileImg,
      position = 'HOMEPAGE_HERO',
      sortOrder = 0,
      isActive = true,
      startDate,
      endDate,
    } = body;

    if (!heading) {
      return errorResponse('Banner heading is required', 400);
    }

    const banner = await prisma.cmsBanner.create({
      data: {
        heading,
        subtitle: subtitle || null,
        ctaText: ctaText || null,
        ctaUrl: ctaUrl || null,
        desktopImg: desktopImg || null,
        mobileImg: mobileImg || null,
        position,
        sortOrder: Number(sortOrder) || 0,
        isActive: Boolean(isActive),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'CREATE_BANNER',
      resourceType: 'CMS_BANNER',
      resourceId: banner.id,
      afterState: banner,
    });

    return successResponse({ banner, data: banner }, 'Banner created successfully in MySQL', 201);
  } catch (error: any) {
    console.error('CMS Banner POST Error:', error);
    return errorResponse(error.message || 'Failed to create banner', 500);
  }
});

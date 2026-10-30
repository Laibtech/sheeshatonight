import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const [configItem, heroItem, sectionsItem, statsItem, announceItem] = await Promise.all([
      prisma.cmsContent.findUnique({ where: { key: 'homepage_config' } }),
      prisma.cmsContent.findUnique({ where: { key: 'homepage_hero' } }),
      prisma.cmsContent.findUnique({ where: { key: 'homepage_sections' } }),
      prisma.cmsContent.findUnique({ where: { key: 'homepage_stats' } }),
      prisma.cmsContent.findUnique({ where: { key: 'announcement_bar' } }),
    ]);

    return successResponse({
      config: configItem?.value || null,
      hero: heroItem?.value || null,
      sections: sectionsItem?.value || null,
      stats: statsItem?.value || null,
      announcement: announceItem?.value || null,
    });
  } catch (error: any) {
    console.error('Homepage CMS GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch homepage configuration', 500);
  }
});

export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { hero, sections, stats, announcement, config } = body;

    const operations: Promise<any>[] = [];

    if (hero !== undefined) {
      operations.push(
        prisma.cmsContent.upsert({
          where: { key: 'homepage_hero' },
          create: { key: 'homepage_hero', value: hero },
          update: { value: hero },
        })
      );
    }

    if (sections !== undefined) {
      operations.push(
        prisma.cmsContent.upsert({
          where: { key: 'homepage_sections' },
          create: { key: 'homepage_sections', value: sections },
          update: { value: sections },
        })
      );
    }

    if (stats !== undefined) {
      operations.push(
        prisma.cmsContent.upsert({
          where: { key: 'homepage_stats' },
          create: { key: 'homepage_stats', value: stats },
          update: { value: stats },
        })
      );
    }

    if (announcement !== undefined) {
      operations.push(
        prisma.cmsContent.upsert({
          where: { key: 'announcement_bar' },
          create: { key: 'announcement_bar', value: announcement },
          update: { value: announcement },
        })
      );
    }

    if (config !== undefined) {
      operations.push(
        prisma.cmsContent.upsert({
          where: { key: 'homepage_config' },
          create: { key: 'homepage_config', value: config },
          update: { value: config },
        })
      );
    }

    await Promise.all(operations);

    // Audit log
    await logAdminAction({
      userId: req.user?.userId,
      action: 'UPDATE_HOMEPAGE_CMS',
      resourceType: 'HOMEPAGE',
      afterState: { hero, sectionsCount: Array.isArray(sections) ? sections.length : undefined },
    });

    return successResponse(null, 'Homepage builder settings published successfully to database');
  } catch (error: any) {
    console.error('Homepage CMS POST Error:', error);
    return errorResponse(error.message || 'Failed to save homepage configuration', 500);
  }
});


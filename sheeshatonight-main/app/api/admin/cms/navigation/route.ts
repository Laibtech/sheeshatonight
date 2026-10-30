import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const [navItem, footerItem] = await Promise.all([
      prisma.cmsContent.findUnique({ where: { key: 'navigation_menu' } }),
      prisma.cmsContent.findUnique({ where: { key: 'footer_content' } }),
    ]);

    return successResponse({
      navigation: navItem?.value || null,
      footer: footerItem?.value || null,
    });
  } catch (error: any) {
    console.error('Navigation CMS GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch navigation and footer', 500);
  }
});

export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { navigation, footer } = body;

    const operations: Promise<any>[] = [];

    if (navigation !== undefined) {
      operations.push(
        prisma.cmsContent.upsert({
          where: { key: 'navigation_menu' },
          create: { key: 'navigation_menu', value: navigation },
          update: { value: navigation },
        })
      );
    }

    if (footer !== undefined) {
      operations.push(
        prisma.cmsContent.upsert({
          where: { key: 'footer_content' },
          create: { key: 'footer_content', value: footer },
          update: { value: footer },
        })
      );
    }

    await Promise.all(operations);

    await logAdminAction({
      userId: req.user?.userId,
      action: 'UPDATE_NAVIGATION_AND_FOOTER',
      resourceType: 'NAVIGATION',
      afterState: { navCount: Array.isArray(navigation) ? navigation.length : undefined },
    });

    return successResponse(null, 'Navigation and Footer settings updated successfully in MySQL');
  } catch (error: any) {
    console.error('Navigation CMS POST Error:', error);
    return errorResponse(error.message || 'Failed to save navigation and footer', 500);
  }
});


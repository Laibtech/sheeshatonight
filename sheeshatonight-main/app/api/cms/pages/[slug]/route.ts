import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cms/pages/[slug]
 * Public endpoint to fetch a CMS page by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';

    const page = await prisma.cmsPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // If draft, only visible if preview parameter is enabled
    if (!page.isActive && !isPreview) {
      return NextResponse.json(
        { success: false, error: 'Page is currently in draft mode and not published' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
      isPreview: !page.isActive,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Database connection offline or page unavailable' },
      { status: 500 }
    );
  }
}

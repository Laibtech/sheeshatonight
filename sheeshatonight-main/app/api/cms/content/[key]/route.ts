import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Publicly readable CMS keys
const ALLOWED_PUBLIC_KEYS = new Set([
  'announcement_bar',
  'navigation_menu',
  'footer_content',
  'homepage_hero',
  'homepage_sections',
  'homepage_stats',
  'marketplace_settings',
  'faqs_list',
  'blogs_list',
  'seo_settings',
  'branding_settings',
]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> | { key: string } }
) {
  try {
    const { key } = await params;

    if (!ALLOWED_PUBLIC_KEYS.has(key)) {
      return NextResponse.json(
        { success: false, message: 'Content key not publicly accessible' },
        { status: 403 }
      );
    }

    const content = await prisma.cmsContent.findUnique({
      where: { key },
    });

    return NextResponse.json({
      success: true,
      data: content ? content.value : null,
    });
  } catch (error: any) {
    console.error(`Public CMS content GET error for key:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

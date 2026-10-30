import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const item = await prisma.cmsContent.findUnique({
      where: { key: 'blogs_list' },
    });

    const list = item?.value && Array.isArray(item.value) ? item.value : [];
    // Only return published blogs to public customers
    const published = list.filter((b: any) => b.published !== false);

    return NextResponse.json({
      success: true,
      data: published,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}


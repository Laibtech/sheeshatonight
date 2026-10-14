import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/middleware';

/**
 * GET /api/categories
 * Public endpoint to list all active categories
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');

    const where: any = {
      isActive: true,
    };

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        isActive: true,
        isFeatured: true,
        sortOrder: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
      categories,
    });
  } catch (error: any) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

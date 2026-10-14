import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Default fallback banners for when database is offline or empty
const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    heading: 'New Flavors Available Now',
    subtitle: 'Explore our premium collection',
    ctaText: 'Shop Now',
    ctaUrl: '/shop',
    position: 'HOMEPAGE_SLIDER',
    isActive: true,
  },
];

// GET: Public endpoint to fetch active banners
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get('position') || 'HOMEPAGE_SLIDER';

    // Try to fetch from database
    let banners: any[] = [];
    try {
      const dbBanners = await prisma.cmsBanner.findMany({
        where: {
          isActive: true,
          position: position,
          OR: [
            { startDate: null },
            { startDate: { lte: new Date() } },
          ],
          AND: [
            {
              OR: [
                { endDate: null },
                { endDate: { gte: new Date() } },
              ],
            },
          ],
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      if (dbBanners && dbBanners.length > 0) {
        banners = dbBanners;
      }
    } catch (dbError) {
      console.warn('Database error fetching CMS banners:', dbError);
      // Database is offline or error occurred - will use fallback
    }

    // If no banners found in database, use fallback
    if (banners.length === 0) {
      banners = DEFAULT_BANNERS.filter((b) => b.position === position);
    }

    // Set cache headers for better performance
    const response = NextResponse.json({
      success: true,
      data: banners,
      source: banners.length > 0 && banners[0].id !== 'default-1' ? 'database' : 'default',
    });

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

    return response;
  } catch (error: any) {
    console.error('CMS Banners GET Error:', error);
    
    // Even on error, return fallback banners
    return NextResponse.json({
      success: true,
      data: DEFAULT_BANNERS,
      source: 'fallback',
      error: 'Database unavailable',
    });
  }
}

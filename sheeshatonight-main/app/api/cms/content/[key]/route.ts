import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Default fallback content for when database is offline or empty
const DEFAULT_CONTENT: Record<string, any> = {
  homepage_hero: {
    heading: 'EXPERIENCE\nSHEESHA\nDIFFERENTLY',
    subheading: 'Find the best sheesha flavors, setups and experiences near you.',
    ctaText: 'Explore Now',
    ctaUrl: '#browse',
  },
  navigation_menu: [
    { id: '1', label: 'Browse', url: '/browse', order: 1 },
    { id: '2', label: 'Stores', url: '/stores', order: 2 },
    { id: '3', label: 'Shop', url: '/shop', order: 3 },
    { id: '4', label: 'Vendors', url: '/vendor-profile', order: 4 },
    { id: '5', label: 'How It Works', url: '/how-it-works', order: 5 },
    { id: '6', label: 'About Us', url: '/about', order: 6 },
    { id: '7', label: 'Contact', url: '/contact', order: 7 },
  ],
};

// GET: Public endpoint to fetch CMS content by key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> | { key: string } }
) {
  try {
    const resolvedParams = await params;
    const { key } = resolvedParams;

    // Try to fetch from database
    let content = null;
    try {
      const cmsContent = await prisma.cmsContent.findUnique({
        where: { key },
      });
      
      if (cmsContent) {
        content = cmsContent.value;
      }
    } catch (dbError) {
      console.warn(`Database error fetching CMS content '${key}':`, dbError);
      // Database is offline or error occurred - will use fallback
    }

    // If no content found in database, use fallback
    if (!content) {
      content = DEFAULT_CONTENT[key] || null;
    }

    // Set cache headers for better performance
    const response = NextResponse.json({
      success: true,
      data: content,
      source: content && content !== DEFAULT_CONTENT[key] ? 'database' : 'default',
    });

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

    return response;
  } catch (error: any) {
    console.error('CMS Content GET Error:', error);
    
    // Even on error, return fallback content
    const resolvedParams = await Promise.resolve(params);
    const key = resolvedParams?.key;
    const fallbackContent = key ? (DEFAULT_CONTENT[key] || null) : null;
    
    return NextResponse.json({
      success: true,
      data: fallbackContent,
      source: 'fallback',
      error: 'Database unavailable',
    });
  }
}

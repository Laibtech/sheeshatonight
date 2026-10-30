import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest, errorResponse, successResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: string;
  readTime: string;
  published: boolean;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: '1',
    slug: 'best-shisha-flavors-2026',
    title: 'Top 10 Best Shisha Flavors to Try in 2026',
    excerpt: 'Discover the most popular and trending shisha flavors that will elevate your smoking experience this year.',
    content: `<p>Shisha culture has evolved significantly over the years, and 2026 brings an exciting array of flavors that cater to both traditional enthusiasts and modern experimenters. In this comprehensive guide, we'll explore the top 10 flavors that are making waves in the UAE shisha scene.</p><h2>1. Double Apple - The Timeless Classic</h2><p>Double Apple remains the gold standard for shisha lovers worldwide. This iconic flavor combines sweet red apple with a hint of anise, creating a smooth and aromatic experience.</p><h2>2. Lemon Mint - Refreshing Excellence</h2><p>The perfect balance of zesty lemon and cool mint creates an incredibly refreshing smoking experience. Ideal for Dubai's warm evenings.</p>`,
    image: '/blog.webp',
    author: 'Ahmed Hassan',
    category: 'Flavors',
    readTime: '5 min read',
    published: true,
    publishedAt: '2026-06-10T00:00:00.000Z',
    seoTitle: 'Top 10 Best Shisha Flavors 2026 | SheeshaTonight Blog',
    seoDescription: 'Discover the top 10 shisha flavors in Dubai and UAE for 2026.',
  },
  {
    id: '2',
    slug: 'villa-party-setup-guide',
    title: 'Complete Guide to Hosting the Perfect Villa Party with Shisha',
    excerpt: 'Learn expert tips and tricks for organizing an unforgettable villa party with premium shisha setup.',
    content: `<p>Hosting a villa party in Dubai with premium shisha setup can transform a regular gathering into an unforgettable experience. This comprehensive guide will walk you through everything you need to know to plan and execute the perfect event.</p><h2>1. Choose the Right Location</h2><p>Whether poolside or on the rooftop, ventilation and wind protection are key to a steady coal burn and smooth session.</p>`,
    image: '/villa.png',
    author: 'Sara Ali',
    category: 'Events',
    readTime: '8 min read',
    published: true,
    publishedAt: '2026-06-08T00:00:00.000Z',
    seoTitle: 'Villa Party Shisha Setup Guide Dubai | SheeshaTonight',
    seoDescription: 'Expert tips for hosting luxury private villa shisha parties in Dubai.',
  },
  {
    id: '3',
    slug: 'yacht-party-shisha-guide',
    title: 'Yacht Party Shisha Rental: Everything You Need to Know',
    excerpt: 'Planning a yacht party? Here is your complete guide to booking and enjoying shisha on a luxury yacht in Dubai.',
    content: `<p>Nothing compares to enjoying artisanal shisha against the backdrop of the Dubai Marina skyline and Burj Al Arab at sunset.</p><h2>Marine-Grade Stability</h2><p>Our Russian stainless steel hookahs feature heavy crystal bases engineered for maximum stability during yacht cruises.</p>`,
    image: '/yacht.png',
    author: 'Omar Mansoor',
    category: 'Events',
    readTime: '7 min read',
    published: true,
    publishedAt: '2026-06-03T00:00:00.000Z',
    seoTitle: 'Yacht Party Shisha Rental Dubai | SheeshaTonight',
    seoDescription: 'Book luxury yacht shisha catering and sommelier service across Dubai Marina.',
  },
];

// GET: Fetch all blog articles
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const item = await prisma.cmsContent.findUnique({
      where: { key: 'blogs_list' },
    });

    const blogs = item?.value && Array.isArray(item.value) ? item.value : DEFAULT_BLOGS;
    return successResponse(blogs, 'Blogs retrieved successfully');
  } catch (error: any) {
    console.error('Blogs GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch blogs', 500);
  }
});

// POST: Save blogs list or create article
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { blogs } = body;

    if (!Array.isArray(blogs)) {
      return errorResponse('Blogs array is required', 400);
    }

    const updated = await prisma.cmsContent.upsert({
      where: { key: 'blogs_list' },
      create: { key: 'blogs_list', value: blogs },
      update: { value: blogs },
    });

    await logAdminAction({
      userId: req.user?.userId,
      action: 'UPDATE_BLOGS',
      resourceType: 'BLOGS',
      afterState: { count: blogs.length },
    });

    return successResponse(updated.value, 'Blog articles saved in MySQL');
  } catch (error: any) {
    console.error('Blogs POST Error:', error);
    return errorResponse(error.message || 'Failed to update blog articles', 500);
  }
});


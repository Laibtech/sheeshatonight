import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function resolveImageUrl(images: any): string {
  const defaultFallback = 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800';
  if (!images) return defaultFallback;
  try {
    const parsed = typeof images === 'string' && (images.startsWith('[') || images.startsWith('{')) ? JSON.parse(images) : images;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (typeof first === 'string' && first.trim() !== '') return first.trim();
    } else if (typeof parsed === 'string' && parsed.trim() !== '') {
      return parsed.trim();
    }
  } catch {
    if (typeof images === 'string' && images.trim() !== '') return images.trim();
  }
  return defaultFallback;
}

function parseLocation(loc: any): string {
  if (!loc) return 'Dubai, UAE';
  if (typeof loc === 'string') {
    try {
      const parsed = JSON.parse(loc);
      return parsed.address || parsed.city || loc;
    } catch {
      return loc;
    }
  }
  if (typeof loc === 'object') {
    return loc.address || loc.city || 'Dubai, UAE';
  }
  return 'Dubai, UAE';
}

// GET - Fetch single vendor by ID or slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await params;
    const vendor = await prisma.vendor.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            kycStatus: true,
          },
        },
        products: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            images: true,
            type: true,
            stock: true,
            sku: true,
          },
          take: 50,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const formattedLocation = parseLocation(vendor.location);

    return NextResponse.json({
      success: true,
      data: {
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
        description: vendor.description || 'Luxury Sheesha Lounge & Marketplace Partner in UAE.',
        tier: vendor.tier,
        isActive: vendor.isActive,
        location: formattedLocation,
        phone: vendor.phone || '+971 4 333 9988',
        kycStatus: vendor.user.kycStatus,
        rating: 4.9,
        reviews: 48,
        image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600',
        bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
        services: ['VIP Cabana Rental', 'Express Doorstep Delivery', 'Custom Flavor Mixing', 'Event Catering'],
        productsCount: vendor._count.products,
        ordersCount: vendor._count.orders,
        products: vendor.products.map((p) => {
          const mainImg = resolveImageUrl(p.images);
          return {
            id: p.id,
            name: p.title,
            title: p.title,
            description: p.description || '',
            price: Number(p.price),
            currency: p.currency,
            image: mainImg,
            images: [mainImg],
            type: p.type,
            category: p.type,
            stock: p.stock,
            quantity: p.stock,
            rating: 4.8,
            reviews: 12,
            vendorId: vendor.id,
            vendorName: vendor.name,
            vendorLocation: formattedLocation,
          };
        }),
        createdAt: vendor.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

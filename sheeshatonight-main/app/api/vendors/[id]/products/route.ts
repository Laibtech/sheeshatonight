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
      select: { id: true, name: true, location: true },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        vendorId: vendor.id,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    const vendorLoc = parseLocation(vendor.location);

    const formatted = products.map((p) => {
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
        vendorLocation: vendorLoc,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length,
    });
  } catch (error: any) {
    console.error('Error fetching vendor products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vendor products' },
      { status: 500 }
    );
  }
}

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

// GET - Fetch single product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            phone: true,
            location: true,
            tier: true,
            description: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const mainImg = resolveImageUrl(product.images);
    let imgList: string[] = [mainImg];
    try {
      const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(parsed) && parsed.length > 0) {
        imgList = parsed.filter((i: any) => typeof i === 'string' && i.trim().length > 0);
      }
    } catch {}

    const formattedLocation = parseLocation(product.vendor.location);

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.title,
        title: product.title,
        description: product.description || '',
        brand: product.vendor.name,
        vendor: product.vendor.name,
        vendorId: product.vendor.id,
        location: formattedLocation,
        vendorLocation: formattedLocation,
        category: product.type,
        price: Number(product.price),
        currency: product.currency,
        type: product.type,
        stock: product.stock,
        quantity: product.stock,
        rating: 4.8,
        reviews: 24,
        image: mainImg,
        images: imgList.length > 0 ? imgList : [mainImg],
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        sku: product.sku,
        createdAt: product.createdAt,
        vendorInfo: {
          id: product.vendor.id,
          name: product.vendor.name,
          phone: product.vendor.phone,
          location: formattedLocation,
          tier: product.vendor.tier,
          description: product.vendor.description || '',
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

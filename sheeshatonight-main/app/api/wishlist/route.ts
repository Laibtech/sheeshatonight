import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

/**
 * GET /api/wishlist - Get user's wishlist
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { vendor: { select: { id: true, name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out deleted or missing products
    const validItems = items.filter(
      (item) => item.product && !(item.product as any).deletedAt
    );

    return NextResponse.json({
      success: true,
      data: {
        items: validItems,
        count: validItems.length,
      },
    });

  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/wishlist - Add item(s) to wishlist (supports single productId or batch productIds)
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, productIds } = body;

    // Handle batch sync (e.g. merging guest wishlist on login)
    if (Array.isArray(productIds) && productIds.length > 0) {
      const validProductIds: string[] = [];
      const products = await prisma.product.findMany({
        where: { id: { in: productIds.map(String) } },
        select: { id: true },
      });
      const existingIds = new Set(products.map((p) => p.id));

      for (const id of productIds) {
        const strId = String(id);
        if (existingIds.has(strId)) {
          validProductIds.push(strId);
          await prisma.wishlist.upsert({
            where: { userId_productId: { userId, productId: strId } },
            create: { userId, productId: strId },
            update: {},
          });
        }
      }

      const totalItems = await prisma.wishlist.count({ where: { userId } });
      return NextResponse.json({
        success: true,
        message: `${validProductIds.length} items synced to wishlist`,
        data: { syncedCount: validProductIds.length, totalCount: totalItems },
      });
    }

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const strProductId = String(productId);

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: strProductId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const wishlistItem = await prisma.wishlist.upsert({
      where: { userId_productId: { userId, productId: strProductId } },
      create: { userId, productId: strProductId },
      update: {},
      include: {
        product: {
          include: { vendor: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    const count = await prisma.wishlist.count({ where: { userId } });

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist',
      data: { item: wishlistItem, count },
    });

  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/wishlist - Remove item from wishlist (or clear all if productId is 'all' or empty)
 */
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const isAll = searchParams.get('all') === 'true' || productId === 'all' || !productId;

    if (isAll) {
      await prisma.wishlist.deleteMany({
        where: { userId },
      });

      return NextResponse.json({
        success: true,
        message: 'Wishlist cleared successfully',
        data: { count: 0 },
      });
    }

    await prisma.wishlist.deleteMany({
      where: { userId, productId: String(productId) },
    });

    const count = await prisma.wishlist.count({ where: { userId } });

    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist',
      data: { count },
    });

  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
});

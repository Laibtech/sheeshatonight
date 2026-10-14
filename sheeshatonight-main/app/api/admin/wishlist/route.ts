import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { getPaginationParams, buildPaginationResponse } from '@/lib/utils';

/**
 * GET /api/admin/wishlist
 * Admin analytics and activity for customer wishlists
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip, take } = getPaginationParams(searchParams);
    const search = searchParams.get('search')?.trim();

    // Query filters
    const where: any = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { product: { title: { contains: search } } },
      ];
    }

    // 1. Fetch paginated wishlist items
    const [items, totalItems] = await Promise.all([
      prisma.wishlist.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              type: true,
              stock: true,
              vendor: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      prisma.wishlist.count({ where }),
    ]);

    // 2. Fetch top wishlisted products
    const topWishlistGroups = await prisma.wishlist.groupBy({
      by: ['productId'],
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: 8,
    });

    const topProductIds = topWishlistGroups.map((g) => g.productId);
    const topProductsInfo = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        type: true,
        stock: true,
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const topProducts = topWishlistGroups.map((group) => {
      const prod = topProductsInfo.find((p) => p.id === group.productId);
      return {
        id: group.productId,
        title: prod?.title || 'Unknown Product',
        price: prod?.price || 0,
        images: prod?.images,
        type: prod?.type || 'SHEESHA',
        stock: prod?.stock ?? 0,
        vendorName: prod?.vendor?.name || 'Verified Vendor',
        savesCount: group._count.productId,
      };
    });

    // 3. Overall KPI Stats
    const [allWishlistCount, uniqueUserCount, allProductsInWishlist] = await Promise.all([
      prisma.wishlist.count(),
      prisma.wishlist.groupBy({
        by: ['userId'],
      }).then((res) => res.length),
      prisma.wishlist.findMany({
        select: {
          product: {
            select: {
              price: true,
            },
          },
        },
      }),
    ]);

    const totalPotentialValue = allProductsInWishlist.reduce((acc, curr) => {
      return acc + (Number(curr.product?.price) || 0);
    }, 0);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        pageSize,
        total: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
      stats: {
        totalSavedItems: allWishlistCount,
        uniqueCustomers: uniqueUserCount,
        potentialDemandValue: totalPotentialValue,
        topProductsCount: topProducts.length,
      },
      topProducts,
    });
  } catch (error: any) {
    console.error('Error fetching admin wishlist data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch wishlist data' },
      { status: 500 }
    );
  }
});

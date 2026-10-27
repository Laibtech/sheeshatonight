import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { sanitizeText } from '@/lib/utils';

/**
 * GET /api/reviews - Get reviews (filter by productId or vendorId)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const vendorId = searchParams.get('vendorId');
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100);

    const where: any = { status: 'APPROVED' };
    
    if (productId) where.productId = productId;
    if (vendorId) where.vendorId = vendorId;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        userId: true,
      },
    });

    // Get user names
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await prisma.user.findUnique({
          where: { id: review.userId },
          select: { name: true },
        });
        return {
          ...review,
          userName: user?.name || 'Anonymous',
        };
      })
    );

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviewsWithUsers,
        totalReviews: reviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews - Create a review
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
    const { productId, vendorId, rating, comment } = body;

    // Must provide either productId or vendorId
    if (!productId && !vendorId) {
      return NextResponse.json(
        { success: false, error: 'Must provide productId or vendorId' },
        { status: 400 }
      );
    }

    // Validate rating
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate and sanitize comment input
    if (comment !== undefined && comment !== null && typeof comment !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Comment must be a text string' },
        { status: 400 }
      );
    }

    const rawComment = (comment || '').trim();
    if (rawComment.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Comment must be 1000 characters or less' },
        { status: 400 }
      );
    }
    const cleanComment = rawComment ? sanitizeText(rawComment) : null;

    // Check if user has completed an order with this product/vendor
    if (productId) {
      const hasOrdered = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId,
            status: 'COMPLETED',
          },
        },
      });

      if (!hasOrdered) {
        return NextResponse.json(
          { success: false, error: 'You can only review products you have purchased and received' },
          { status: 403 }
        );
      }

      // Check if user already reviewed this product
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          productId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product' },
          { status: 400 }
        );
      }
    }

    if (vendorId) {
      // Check if user has completed an order with this vendor
      const hasOrdered = await prisma.order.findFirst({
        where: {
          userId,
          vendorId,
          status: 'COMPLETED',
        },
      });

      if (!hasOrdered) {
        return NextResponse.json(
          { success: false, error: 'You can only review vendors you have ordered from' },
          { status: 403 }
        );
      }

      // Check if user already reviewed this vendor
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          vendorId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this vendor' },
          { status: 400 }
        );
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId: productId || null,
        vendorId: vendorId || null,
        rating: numRating,
        comment: cleanComment,
        status: 'APPROVED', // Auto-approve for MVP
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
});

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

interface RouteContext {
  params: {
    itemId: string;
  };
}

// PATCH - Update cart item quantity
export const PATCH = withAuth(async (req: AuthenticatedRequest, context: RouteContext) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { itemId } = context.params;
    const body = await req.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    // Find cart item
    const cartItem = await prisma.cart.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (cartItem.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check stock availability
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { success: false, error: `Only ${cartItem.product.stock} items available in stock` },
        { status: 400 }
      );
    }

    // Update quantity
    const updated = await prisma.cart.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Cart updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update cart' },
      { status: 500 }
    );
  }
});

// DELETE - Remove item from cart
export const DELETE = withAuth(async (req: AuthenticatedRequest, context: RouteContext) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { itemId } = context.params;

    // Delete item atomically using deleteMany (safe against race conditions & double clicks)
    await prisma.cart.deleteMany({
      where: {
        id: itemId,
        userId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });

  } catch (error: any) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove item' },
      { status: 500 }
    );
  }
});

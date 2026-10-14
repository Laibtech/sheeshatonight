import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { stripe, isStripeConfigured } from '@/lib/stripe';

/**
 * POST /api/payments/stripe/checkout
 * Create a Stripe Checkout Session for the authenticated customer's cart
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        {
          success: false,
          error: 'Online card payment gateway is currently unconfigured. Please select Cash on Delivery at checkout.',
          gatewayAvailable: false,
        },
        { status: 503 }
      );
    }

    // Fetch user cart
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Your cart is empty' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Build line items
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: (item.product.currency || 'AED').toLowerCase(),
        product_data: {
          name: item.product.title,
          description: item.product.description || undefined,
        },
        unit_amount: Math.round(Number(item.product.price) * 100), // AED in fils
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      customer_email: req.user?.email,
      client_reference_id: userId,
      metadata: {
        userId,
        cartItemCount: cartItems.length.toString(),
      },
      success_url: `${baseUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?cancelled=true`,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate card payment session' },
      { status: 500 }
    );
  }
});

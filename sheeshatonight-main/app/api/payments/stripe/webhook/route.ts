import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyStripeSignature,
  isEventAlreadyProcessed,
  markEventAsProcessed,
  isStripeWebhookConfigured,
} from '@/lib/stripe';

/**
 * POST /api/payments/stripe/webhook
 * Signature-verified, database-backed idempotent Stripe Webhook handler
 * Enforces payment-to-order ownership, currency & amount verification, and safe status transitions
 */
export async function POST(req: NextRequest) {
  try {
    if (!isStripeWebhookConfigured()) {
      return NextResponse.json(
        { error: 'Stripe webhook is unconfigured on this environment.' },
        { status: 503 }
      );
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    let event;

    try {
      event = verifyStripeSignature(rawBody, signature);
    } catch (err: any) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Signature Verification Failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Persistent database-backed idempotency check
    const isDuplicate = await isEventAlreadyProcessed(event.id);
    if (isDuplicate) {
      console.log(`[Stripe Webhook] Duplicate event ${event.id} already processed. Skipping.`);
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    let affectedUserId: string | undefined;
    let affectedOrderNumber: string | undefined;

    // Process relevant webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.client_reference_id || session.metadata?.userId;
        const orderNumber = session.metadata?.orderNumber;
        affectedUserId = userId;
        affectedOrderNumber = orderNumber;

        console.log(`[Stripe Webhook] Processing checkout.session.completed for user ${userId}, order ${orderNumber}`);

        if (orderNumber) {
          const order = await prisma.order.findUnique({
            where: { orderNumber },
            include: { user: true },
          });

          if (!order) {
            console.warn(`[Stripe Webhook] Order ${orderNumber} not found in database.`);
            break;
          }

          // 1. Payment-to-Order Ownership Verification
          if (userId && order.userId !== userId) {
            console.error(`[SECURITY ALERT] Payment user mismatch: session userId (${userId}) != order.userId (${order.userId})`);
            await prisma.auditLog.create({
              data: {
                userId: userId || 'unknown',
                action: 'PAYMENT_OWNERSHIP_MISMATCH',
                resourceType: 'Order',
                resourceId: order.id,
                afterState: JSON.stringify({ eventId: event.id, sessionUserId: userId, orderUserId: order.userId }),
              },
            });
            return NextResponse.json({ error: 'Order ownership verification failed' }, { status: 400 });
          }

          // 2. Amount and Currency Verification
          const paidCurrency = (session.currency || '').toUpperCase();
          const expectedCurrency = (order.currency || 'AED').toUpperCase();
          const paidAmountFils = session.amount_total; // in fils / cents
          const expectedAmountFils = Math.round(Number(order.totalAmount) * 100);

          if (paidCurrency !== expectedCurrency) {
            console.error(`[SECURITY ALERT] Currency mismatch for order ${orderNumber}: paid ${paidCurrency}, expected ${expectedCurrency}`);
            await prisma.order.update({
              where: { id: order.id },
              data: {
                notes: `SECURITY FLAG: Currency mismatch (paid ${paidCurrency}, expected ${expectedCurrency})`,
              },
            });
            break;
          }

          if (paidAmountFils < expectedAmountFils) {
            console.error(`[SECURITY ALERT] Underpayment detected for order ${orderNumber}: paid ${paidAmountFils} fils, expected ${expectedAmountFils} fils`);
            await prisma.order.update({
              where: { id: order.id },
              data: {
                payoutStatus: 'FAILED',
                notes: `SECURITY FLAG: Underpayment detected (paid ${paidAmountFils/100} ${paidCurrency}, expected ${order.totalAmount})`,
              },
            });
            break;
          }

          // 3. Safe Payment Status Transition
          await prisma.order.update({
            where: { id: order.id },
            data: {
              payoutStatus: 'PENDING',
              status: 'PREPARING',
              acceptedAt: new Date(),
            },
          });

          // Log OrderTracking event
          await prisma.orderTracking.upsert({
            where: { orderId: order.id },
            create: {
              orderId: order.id,
              status: 'PREPARING',
              events: [
                {
                  status: 'PREPARING',
                  note: `Card payment verified via Stripe (${session.id})`,
                  timestamp: new Date().toISOString(),
                },
              ],
            },
            update: {
              status: 'PREPARING',
              lastUpdated: new Date(),
            },
          });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        const orderNumber = paymentIntent.metadata?.orderNumber;
        affectedOrderNumber = orderNumber;

        console.log(`[Stripe Webhook] Processing payment_intent.succeeded for order ${orderNumber}`);
        if (orderNumber) {
          const order = await prisma.order.findUnique({
            where: { orderNumber },
          });

          if (order) {
            const paidAmountFils = paymentIntent.amount;
            const expectedAmountFils = Math.round(Number(order.totalAmount) * 100);

            if (paidAmountFils >= expectedAmountFils) {
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  status: 'PREPARING',
                },
              });
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        const orderNumber = paymentIntent.metadata?.orderNumber;
        const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
        affectedOrderNumber = orderNumber;

        console.warn(`[Stripe Webhook] Payment failed for order ${orderNumber}: ${failureMessage}`);
        if (orderNumber) {
          await prisma.order.updateMany({
            where: { orderNumber },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
              notes: `Payment Failed: ${failureMessage}`,
            },
          });
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    // Persist event in database AuditLog and memory cache
    await markEventAsProcessed(event.id, {
      userId: affectedUserId,
      orderNumber: affectedOrderNumber,
      details: { type: event.type, orderNumber: affectedOrderNumber },
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Stripe webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}

import Stripe from 'stripe';
import { prisma } from './prisma';

/**
 * Stripe Payment Gateway Service for SheeshaTonight
 * Handles Checkout Sessions, Webhook Signatures, and Database-Backed Idempotency
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Singleton Stripe client instance (or null if unconfigured)
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      typescript: true,
    })
  : null;

export function isStripeConfigured(): boolean {
  return Boolean(stripe && stripeSecretKey);
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(stripeWebhookSecret);
}

// In-memory fast cache for recent event IDs
const processedWebhookEvents = new Set<string>();

/**
 * Check if a webhook event was already processed (checking fast-cache and persistent DB AuditLog)
 */
export async function isEventAlreadyProcessed(eventId: string): Promise<boolean> {
  if (processedWebhookEvents.has(eventId)) {
    return true;
  }

  try {
    const existing = await prisma.auditLog.findFirst({
      where: {
        action: 'STRIPE_WEBHOOK_EVENT',
        resourceId: eventId,
      },
      select: { id: true },
    });
    if (existing) {
      processedWebhookEvents.add(eventId);
      return true;
    }
  } catch (err) {
    console.warn('[Stripe Idempotency] DB query check skipped:', err);
  }

  return false;
}

/**
 * Record event in both memory cache and persistent database AuditLog
 */
export async function markEventAsProcessed(eventId: string, metadata?: { userId?: string; orderNumber?: string; details?: any }): Promise<void> {
  processedWebhookEvents.add(eventId);
  if (processedWebhookEvents.size > 2000) {
    const oldest = Array.from(processedWebhookEvents).slice(0, 500);
    for (const id of oldest) {
      processedWebhookEvents.delete(id);
    }
  }

  try {
    await prisma.auditLog.create({
      data: {
        userId: metadata?.userId || 'system',
        action: 'STRIPE_WEBHOOK_EVENT',
        resourceType: 'StripeEvent',
        resourceId: eventId,
        afterState: metadata?.details ? JSON.stringify(metadata.details) : null,
      },
    });
  } catch (err) {
    console.error('[Stripe Idempotency] Failed to write event to AuditLog:', err);
  }
}

/**
 * Verify Stripe webhook signature against raw request payload
 */
export function verifyStripeSignature(rawBody: string | Buffer, signature: string): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe is not initialized. STRIPE_SECRET_KEY is missing.');
  }
  if (!stripeWebhookSecret) {
    throw new Error('Stripe Webhook Secret is not configured. STRIPE_WEBHOOK_SECRET is missing.');
  }

  return stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
}

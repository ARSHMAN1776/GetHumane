/**
 * lib/stripe.ts
 * Stripe server-side client and helpers for GetHumane.
 *
 * IMPORTANT: Only import this file in Server Components or Route Handlers.
 * Never import it in Client Components — it exposes the secret key.
 */

import Stripe from 'stripe'

// ─── Stripe server instance ───────────────────────────────────────────────────
if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'development') {
  throw new Error(
    'Missing STRIPE_SECRET_KEY environment variable. ' +
    'Copy .env.example to .env.local and fill in your Stripe keys.'
  )
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', {
  apiVersion: '2026-05-27.dahlia',
  typescript: true,
})

// ─── Payment Intent Helper ────────────────────────────────────────────────────

interface CreatePaymentIntentParams {
  /** Total amount in dollars (will be converted to cents) */
  amountUsd: number
  /** Supabase booking ID — stored as metadata for webhook reconciliation */
  bookingId: string
  /** Provider's name for the payment description */
  providerName: string
}

/**
 * Creates a Stripe PaymentIntent for a booking.
 * Returns the clientSecret so the browser can confirm payment.
 */
export async function createPaymentIntent({
  amountUsd,
  bookingId,
  providerName,
}: CreatePaymentIntentParams): Promise<{ clientSecret: string }> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amountUsd * 100), // Stripe uses cents
    currency: 'usd',
    description: `GetHumane booking with ${providerName}`,
    metadata: {
      booking_id: bookingId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  if (!paymentIntent.client_secret) {
    throw new Error('Stripe did not return a client_secret')
  }

  return { clientSecret: paymentIntent.client_secret }
}

// ─── Webhook signature verification ──────────────────────────────────────────

/**
 * Verifies a Stripe webhook payload and returns the event.
 * Use in /api/stripe/webhook/route.ts.
 */
export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET')

  return stripe.webhooks.constructEvent(body, signature, secret)
}

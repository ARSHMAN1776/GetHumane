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
 * Creates a Stripe PaymentIntent with manual capture (escrow model).
 * The payment is authorized but NOT captured until the session completes.
 */
export async function createPaymentIntent({
  amountUsd,
  bookingId,
  providerName,
}: CreatePaymentIntentParams): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amountUsd * 100),
    currency: 'usd',
    description: `GetHumane booking with ${providerName}`,
    capture_method: 'manual', // escrow: authorize now, capture on completion
    metadata: { booking_id: bookingId },
    automatic_payment_methods: { enabled: true },
  })

  if (!paymentIntent.client_secret) {
    throw new Error('Stripe did not return a client_secret')
  }

  return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }
}

/**
 * Captures an authorized PaymentIntent (releases escrow to provider).
 * Call this when a booking session is marked completed.
 */
export async function capturePaymentIntent(paymentIntentId: string): Promise<void> {
  await stripe.paymentIntents.capture(paymentIntentId)
}

/**
 * Cancels an authorized PaymentIntent (releases escrow back to seeker).
 * Call this when a booking is cancelled before completion.
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<void> {
  await stripe.paymentIntents.cancel(paymentIntentId)
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

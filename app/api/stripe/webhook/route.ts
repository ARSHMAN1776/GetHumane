/**
 * app/api/stripe/webhook/route.ts
 * Handles Stripe webhook events.
 *
 * Important: This route must receive the raw request body for signature
 * verification. Do NOT use body parsers before constructWebhookEvent().
 */

import { NextRequest } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

// Tell Next.js not to parse the body — Stripe needs the raw bytes for HMAC verification
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  let event
  try {
    event = await constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err)
    return Response.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    )
  }

  const supabase = await createServerClient()

  // ── Handle events ────────────────────────────────────────────────────────
  switch (event.type) {

    // Payment succeeded → confirm booking
    case 'payment_intent.succeeded': {
      const pi        = event.data.object
      const bookingId = pi.metadata?.booking_id

      if (bookingId) {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId)

        if (error) {
          console.error('[stripe/webhook] Failed to confirm booking:', error)
          return Response.json({ error: 'DB update failed.' }, { status: 500 })
        }

        console.log(`[stripe/webhook] Booking ${bookingId} confirmed.`)
      }
      break
    }

    // Payment failed → mark booking as cancelled
    case 'payment_intent.payment_failed': {
      const pi        = event.data.object
      const bookingId = pi.metadata?.booking_id

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId)

        console.log(`[stripe/webhook] Booking ${bookingId} cancelled (payment failed).`)
      }
      break
    }

    // Refund issued → mark booking as cancelled
    case 'charge.refunded': {
      const charge    = event.data.object
      const pi        = charge.payment_intent as string | undefined

      if (pi) {
        // Look up booking by matching PaymentIntent metadata isn't directly available here,
        // so we'd need to store the PaymentIntent ID on the booking. Logged for now.
        console.log(`[stripe/webhook] Refund for PaymentIntent ${pi}`)
      }
      break
    }

    default:
      // Unhandled event — log and acknowledge
      console.log(`[stripe/webhook] Unhandled event type: ${event.type}`)
  }

  // Stripe requires a 200 response to acknowledge receipt
  return Response.json({ received: true })
}

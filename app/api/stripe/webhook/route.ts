/**
 * app/api/stripe/webhook/route.ts
 * Handles Stripe webhook events — payments AND identity verification.
 */
import { NextRequest } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

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
    return Response.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
  }

  const supabase = await createServerClient()

  switch (event.type) {

    // ── Payment succeeded → confirm booking ─────────────────────────────
    case 'payment_intent.succeeded': {
      const pi        = event.data.object
      const bookingId = pi.metadata?.booking_id
      if (bookingId) {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'confirmed', stripe_payment_intent_id: pi.id })
          .eq('id', bookingId)
        if (error) console.error('[stripe/webhook] Failed to confirm booking:', error)
        else console.log(`[stripe/webhook] Booking ${bookingId} confirmed.`)
      }
      break
    }

    // ── Payment failed → cancel booking ─────────────────────────────────
    case 'payment_intent.payment_failed': {
      const pi        = event.data.object
      const bookingId = pi.metadata?.booking_id
      if (bookingId) {
        await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
        console.log(`[stripe/webhook] Booking ${bookingId} cancelled (payment failed).`)
      }
      break
    }

    // ── Refund issued ────────────────────────────────────────────────────
    case 'charge.refunded': {
      const charge = event.data.object
      console.log(`[stripe/webhook] Refund for charge ${charge.id}`)
      break
    }

    // ── Identity verification succeeded → mark provider verified ────────
    case 'identity.verification_session.verified': {
      const session = event.data.object
      const userId  = session.metadata?.user_id
      if (userId) {
        const { error } = await supabase
          .from('users')
          .update({ is_verified: true })
          .eq('id', userId)
        if (error) console.error('[stripe/webhook] Failed to mark user verified:', error)
        else console.log(`[stripe/webhook] User ${userId} is now verified.`)
      }
      break
    }

    // ── Identity verification failed ─────────────────────────────────────
    case 'identity.verification_session.requires_input': {
      const session = event.data.object
      console.log(`[stripe/webhook] Verification needs more input for user ${session.metadata?.user_id}`)
      break
    }

    // ── Subscription created / updated → grant Pro ───────────────────────
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub    = event.data.object
      const userId = sub.metadata?.user_id
      if (userId) {
        const isActive = ['active', 'trialing'].includes(sub.status)
        await supabase.from('users').update({
          is_pro:               isActive,
          subscription_status:  sub.status,
          subscription_end_at:  (sub as any).current_period_end
            ? new Date((sub as any).current_period_end * 1000).toISOString()
            : null,
        }).eq('id', userId)
        console.log(`[stripe/webhook] User ${userId} subscription: ${sub.status}`)
      }
      break
    }

    // ── Subscription cancelled → revoke Pro ──────────────────────────────
    case 'customer.subscription.deleted': {
      const sub    = event.data.object
      const userId = sub.metadata?.user_id
      if (userId) {
        await supabase.from('users').update({
          is_pro:              false,
          subscription_status: 'cancelled',
          subscription_end_at: null,
        }).eq('id', userId)
        console.log(`[stripe/webhook] User ${userId} Pro cancelled.`)
      }
      break
    }

    default:
      console.log(`[stripe/webhook] Unhandled event: ${event.type}`)
  }

  return Response.json({ received: true })
}

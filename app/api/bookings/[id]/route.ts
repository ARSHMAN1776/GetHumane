import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { UpdateBookingSchema } from '@/lib/validations'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import {
  sendBookingConfirmedToSeeker,
  sendBookingCancelledEmail,
  sendLeaveReviewEmail,
} from '@/lib/email'
import { capturePaymentIntent, cancelPaymentIntent } from '@/lib/stripe'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const rl = rateLimit(getRateLimitKey(request, 'booking-patch'), LIMITS.general)
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const { id } = await params
    const body   = await request.json()

    const parsed = UpdateBookingSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { status } = parsed.data

    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, provider_id, seeker_id, status, date_time, location, total_price, stripe_payment_intent_id')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return Response.json({ error: 'Booking not found.' }, { status: 404 })
    }

    const isProvider = user.id === booking.provider_id
    const isSeeker   = user.id === booking.seeker_id

    if (!isProvider && !isSeeker) {
      return Response.json({ error: 'Forbidden.' }, { status: 403 })
    }

    if (isSeeker && status !== 'cancelled') {
      return Response.json({ error: 'Seekers can only cancel a booking.' }, { status: 403 })
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return Response.json(
        { error: `Cannot update a booking that is already ${booking.status}.` },
        { status: 409 }
      )
    }

    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // ── Fetch both parties for email ───────────────────────────────────
    const [{ data: provider }, { data: seeker }] = await Promise.all([
      supabase.from('users').select('full_name, email').eq('id', booking.provider_id).single(),
      supabase.from('users').select('full_name, email').eq('id', booking.seeker_id).single(),
    ])

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gethumane.com'

    if (status === 'confirmed') {
      sendBookingConfirmedToSeeker({
        seekerEmail:  seeker?.email ?? '',
        seekerName:   seeker?.full_name ?? 'there',
        providerName: provider?.full_name ?? 'your provider',
        dateTime:     booking.date_time,
        location:     booking.location,
        totalPrice:   booking.total_price,
      }).catch(console.warn)

    }

    if (status === 'cancelled') {
      const isProviderCancelling = isProvider
      const otherName = isProviderCancelling
        ? (seeker?.full_name ?? 'your seeker')
        : (provider?.full_name ?? 'your provider')
      const recipientEmail = isProviderCancelling ? (seeker?.email ?? '') : (provider?.email ?? '')
      const recipientName  = isProviderCancelling ? (seeker?.full_name ?? 'there') : (provider?.full_name ?? 'there')

      sendBookingCancelledEmail({
        recipientEmail,
        recipientName,
        otherPartyName: otherName,
        dateTime:       booking.date_time,
      }).catch(console.warn)
    }

    if (status === 'completed') {
      // ── Release escrow: capture the authorized PaymentIntent ────────────
      if ((booking as any).stripe_payment_intent_id) {
        capturePaymentIntent((booking as any).stripe_payment_intent_id).catch((e) =>
          console.warn('[bookings] Failed to capture escrow payment:', e)
        )
      }
      sendLeaveReviewEmail({
        seekerEmail:  seeker?.email ?? '',
        seekerName:   seeker?.full_name ?? 'there',
        providerName: provider?.full_name ?? 'your provider',
        providerId:   booking.provider_id,
        siteUrl,
      }).catch(console.warn)
    }

    if (status === 'cancelled') {
      // ── Release escrow back to seeker: cancel the authorized PaymentIntent ─
      if ((booking as any).stripe_payment_intent_id) {
        cancelPaymentIntent((booking as any).stripe_payment_intent_id).catch((e) =>
          console.warn('[bookings] Failed to cancel escrow payment:', e)
        )
      }
    }

    return Response.json({ data: updated })
  } catch (err) {
    console.error('[/api/bookings/[id] PATCH]', err)
    return Response.json({ error: 'Failed to update booking. Please try again.' }, { status: 500 })
  }
}

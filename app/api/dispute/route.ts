/**
 * POST /api/dispute
 * Opens a dispute on a booking. Admin team reviews and issues refunds.
 *
 * Requires a `disputes` table:
 *   id, booking_id, opened_by, reason, evidence_text, status ('open'|'resolved'|'closed'), created_at
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import { z } from 'zod'

const DisputeSchema = z.object({
  booking_id:     z.string().uuid(),
  reason:         z.enum(['no_show', 'unsafe_behavior', 'not_as_described', 'payment_issue', 'other']),
  evidence_text:  z.string().min(20, 'Please describe the issue in at least 20 characters').max(2000),
})

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'dispute'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const body   = await request.json()
    const parsed = DisputeSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { booking_id, reason, evidence_text } = parsed.data

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    // Verify user was party to booking
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, provider_id, seeker_id, status')
      .eq('id', booking_id)
      .single()

    if (!booking) return Response.json({ error: 'Booking not found.' }, { status: 404 })

    const isParty = user.id === booking.provider_id || user.id === booking.seeker_id
    if (!isParty) return Response.json({ error: 'Forbidden.' }, { status: 403 })

    // Only allow disputes on confirmed/in_progress/completed bookings
    if (!['confirmed', 'in_progress', 'completed'].includes(booking.status)) {
      return Response.json({ error: 'Disputes can only be opened on active or completed bookings.' }, { status: 400 })
    }

    // Prevent duplicate open dispute
    const { data: existing } = await supabase
      .from('disputes')
      .select('id')
      .eq('booking_id', booking_id)
      .eq('status', 'open')
      .maybeSingle()

    if (existing) {
      return Response.json({ error: 'A dispute is already open for this booking.' }, { status: 409 })
    }

    const { data: dispute, error } = await supabase
      .from('disputes')
      .insert({
        booking_id,
        opened_by:     user.id,
        reason,
        evidence_text,
        status:        'open',
      })
      .select()
      .single()

    if (error) throw error

    // Freeze booking status so neither party can mark complete
    await supabase.from('bookings').update({ status: 'disputed' }).eq('id', booking_id)

    return Response.json({ data: { dispute, message: 'Dispute opened. Our safety team will respond within 24 hours.' } }, { status: 201 })
  } catch (err) {
    console.error('[/api/dispute]', err)
    return Response.json({ error: 'Failed to open dispute. Please try again.' }, { status: 500 })
  }
}

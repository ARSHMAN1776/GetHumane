/**
 * POST /api/checkin
 * Both provider and seeker confirm a session has started.
 * When both check in, booking status moves to 'in_progress'.
 *
 * Requires a `checkins` table:
 *   id, booking_id, user_id, role ('provider'|'seeker'), checked_in_at
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import { z } from 'zod'

const CheckinSchema = z.object({
  booking_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'checkin'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const body   = await request.json()
    const parsed = CheckinSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { booking_id } = parsed.data

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    // Verify user is party to the booking and it's confirmed
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, provider_id, seeker_id, status')
      .eq('id', booking_id)
      .single()

    if (!booking) return Response.json({ error: 'Booking not found.' }, { status: 404 })
    if (booking.status !== 'confirmed') {
      return Response.json({ error: 'Only confirmed bookings can be checked into.' }, { status: 400 })
    }

    const role = user.id === booking.provider_id ? 'provider'
               : user.id === booking.seeker_id   ? 'seeker'
               : null

    if (!role) return Response.json({ error: 'Forbidden.' }, { status: 403 })

    // Upsert checkin
    const { error: checkinErr } = await supabase.from('checkins').upsert({
      booking_id,
      user_id: user.id,
      role,
      checked_in_at: new Date().toISOString(),
    }, { onConflict: 'booking_id,user_id' })

    if (checkinErr) throw checkinErr

    // Check if both parties have now checked in
    const { data: checkins } = await supabase
      .from('checkins')
      .select('role')
      .eq('booking_id', booking_id)

    const roles = (checkins ?? []).map((c) => c.role)
    const bothIn = roles.includes('provider') && roles.includes('seeker')

    if (bothIn) {
      await supabase.from('bookings').update({ status: 'in_progress' }).eq('id', booking_id)
    }

    return Response.json({
      data: {
        checked_in: true,
        both_checked_in: bothIn,
        message: bothIn ? 'Both parties checked in — session is now in progress!' : 'Checked in. Waiting for the other party.',
      },
    })
  } catch (err) {
    console.error('[/api/checkin]', err)
    return Response.json({ error: 'Check-in failed. Please try again.' }, { status: 500 })
  }
}

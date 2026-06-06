/**
 * app/api/bookings/[id]/route.ts
 * PATCH /api/bookings/[id] — update booking status (confirm / cancel).
 *
 * Only the provider of the booking may confirm or cancel.
 * Seekers may also cancel their own pending booking.
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body   = await request.json()
    const { status } = body as { status: string }

    const allowed = ['confirmed', 'cancelled', 'completed']
    if (!allowed.includes(status)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${allowed.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    // Fetch the booking to verify ownership
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, provider_id, seeker_id, status')
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

    // Seekers can only cancel (not confirm or complete)
    if (isSeeker && status !== 'cancelled') {
      return Response.json(
        { error: 'Seekers can only cancel a booking.' },
        { status: 403 }
      )
    }

    // Can't change an already-completed or cancelled booking
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

    return Response.json({ data: updated })
  } catch (err) {
    console.error('[/api/bookings/[id] PATCH]', err)
    return Response.json(
      { error: 'Failed to update booking. Please try again.' },
      { status: 500 }
    )
  }
}

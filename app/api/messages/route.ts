/**
 * GET  /api/messages?booking_id=xxx  — fetch thread
 * POST /api/messages                 — send message
 *
 * Requires a `messages` table:
 *   id, booking_id, sender_id, content, read_at, created_at
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import { z } from 'zod'

const SendSchema = z.object({
  booking_id: z.string().uuid(),
  content:    z.string().min(1).max(2000),
})

export async function GET(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'messages-get'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const bookingId = new URL(request.url).searchParams.get('booking_id')
    if (!bookingId) return Response.json({ error: 'booking_id required.' }, { status: 400 })

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    // Verify access
    const { data: booking } = await supabase
      .from('bookings').select('provider_id, seeker_id').eq('id', bookingId).single()
    if (!booking) return Response.json({ error: 'Booking not found.' }, { status: 404 })
    if (user.id !== booking.provider_id && user.id !== booking.seeker_id) {
      return Response.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(id,full_name,photo_url)')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Mark unread messages as read
    await supabase.from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('booking_id', bookingId)
      .neq('sender_id', user.id)
      .is('read_at', null)

    return Response.json({ data: messages })
  } catch (err) {
    console.error('[/api/messages GET]', err)
    return Response.json({ error: 'Failed to fetch messages.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'messages-post'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const body   = await request.json()
    const parsed = SendSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { booking_id, content } = parsed.data

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: booking } = await supabase
      .from('bookings').select('provider_id, seeker_id, status').eq('id', booking_id).single()
    if (!booking) return Response.json({ error: 'Booking not found.' }, { status: 404 })
    if (user.id !== booking.provider_id && user.id !== booking.seeker_id) {
      return Response.json({ error: 'Forbidden.' }, { status: 403 })
    }
    if (booking.status === 'cancelled') {
      return Response.json({ error: 'Cannot message on a cancelled booking.' }, { status: 400 })
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({ booking_id, sender_id: user.id, content: content.trim() })
      .select('*, sender:users!messages_sender_id_fkey(id,full_name,photo_url)')
      .single()

    if (error) throw error
    return Response.json({ data: message }, { status: 201 })
  } catch (err) {
    console.error('[/api/messages POST]', err)
    return Response.json({ error: 'Failed to send message.' }, { status: 500 })
  }
}

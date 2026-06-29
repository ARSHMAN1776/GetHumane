import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { CreateReviewSchema } from '@/lib/validations'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'reviews'), LIMITS.general)
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const body   = await request.json()
    const parsed = CreateReviewSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { booking_id, reviewee_id, rating, comment } = parsed.data

    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    // Verify the booking exists, is completed, and the reviewer was a party to it
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, provider_id, seeker_id, status')
      .eq('id', booking_id)
      .single()

    if (!booking) {
      return Response.json({ error: 'Booking not found.' }, { status: 404 })
    }

    if (booking.status !== 'completed') {
      return Response.json({ error: 'Reviews can only be left for completed sessions.' }, { status: 400 })
    }

    const isSeeker   = user.id === booking.seeker_id
    const isProvider = user.id === booking.provider_id

    if (!isSeeker && !isProvider) {
      return Response.json({ error: 'Forbidden.' }, { status: 403 })
    }

    // Reviewer must be reviewing the other party
    const expectedReviewee = isSeeker ? booking.provider_id : booking.seeker_id
    if (reviewee_id !== expectedReviewee) {
      return Response.json({ error: 'Invalid reviewee.' }, { status: 400 })
    }

    // Prevent duplicate review
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .eq('reviewer_id', user.id)
      .maybeSingle()

    if (existing) {
      return Response.json({ error: 'You have already reviewed this session.' }, { status: 409 })
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        booking_id,
        reviewer_id: user.id,
        reviewee_id,
        rating,
        comment: comment || null,
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ data: review }, { status: 201 })
  } catch (err) {
    console.error('[/api/reviews POST]', err)
    return Response.json({ error: 'Failed to submit review. Please try again.' }, { status: 500 })
  }
}

/**
 * app/api/bookings/route.ts
 * POST /api/bookings — creates a booking and a Stripe PaymentIntent.
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createPaymentIntent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      provider_id,
      seeker_id,
      date_time,
      location,
      message,
      is_public_meetup,
      total_price,
    } = body

    // ── Validation ────────────────────────────────────────────────────
    if (!provider_id || !seeker_id || !date_time || !location) {
      return Response.json(
        { error: 'Missing required booking fields.' },
        { status: 400 }
      )
    }

    if (!is_public_meetup) {
      return Response.json(
        { error: 'All sessions must be at a public location.' },
        { status: 400 }
      )
    }

    if (typeof total_price !== 'number' || total_price <= 0) {
      return Response.json(
        { error: 'Invalid total price.' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // ── Auth check — verify seeker_id matches session ─────────────────
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== seeker_id) {
      return Response.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // ── Fetch provider name for Stripe description ────────────────────
    const { data: provider } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', provider_id)
      .single()

    // ── Insert booking as pending ──────────────────────────────────────
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        provider_id,
        seeker_id,
        date_time,
        location,
        message:         message || null,
        is_public_meetup,
        total_price,
        status:          'pending',
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // ── Create Stripe PaymentIntent ────────────────────────────────────
    // (with platform fee factored in)
    let clientSecret: string | null = null
    try {
      const pi = await createPaymentIntent({
        amountUsd:    total_price * 1.1, // include 10% platform fee
        bookingId:    booking.id,
        providerName: provider?.full_name ?? 'Provider',
      })
      clientSecret = pi.clientSecret
    } catch (stripeErr) {
      // Stripe failure is non-blocking for now; booking still created as pending
      console.warn('[bookings] Stripe PaymentIntent failed:', stripeErr)
    }

    return Response.json({
      data: {
        booking,
        clientSecret,
      },
    })
  } catch (err) {
    console.error('[/api/bookings POST]', err)
    return Response.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bookings?userId=xxx&role=provider|seeker
 * Returns bookings for a given user.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role   = searchParams.get('role') as 'provider' | 'seeker' | null

    if (!userId || !role) {
      return Response.json({ error: 'Missing userId or role.' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return Response.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const column = role === 'provider' ? 'provider_id' : 'seeker_id'

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq(column, userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ data: bookings })
  } catch (err) {
    console.error('[/api/bookings GET]', err)
    return Response.json({ error: 'Failed to fetch bookings.' }, { status: 500 })
  }
}

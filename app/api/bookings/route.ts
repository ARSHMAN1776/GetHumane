import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createPaymentIntent } from '@/lib/stripe'
import { CreateBookingSchema } from '@/lib/validations'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import { sendNewBookingRequestToProvider } from '@/lib/email'

export async function POST(request: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────
  const rl = rateLimit(getRateLimitKey(request, 'bookings-post'), LIMITS.booking)
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }

  try {
    const body = await request.json()

    // ── Zod validation ─────────────────────────────────────────────────
    const parsed = CreateBookingSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }
    const { provider_id, seeker_id, date_time, location, message, is_public_meetup, total_price } = parsed.data

    const supabase = await createServerClient()

    // ── Auth check — seeker_id must match session ──────────────────────
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== seeker_id) {
      return Response.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // ── Prevent booking yourself ────────────────────────────────────────
    if (provider_id === seeker_id) {
      return Response.json({ error: 'You cannot book yourself.' }, { status: 400 })
    }

    // ── Prevent duplicate pending/confirmed booking ────────────────────
    const { data: duplicate } = await supabase
      .from('bookings')
      .select('id')
      .eq('provider_id', provider_id)
      .eq('seeker_id', seeker_id)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle()

    if (duplicate) {
      return Response.json(
        { error: 'You already have an active booking with this provider.' },
        { status: 409 }
      )
    }

    // ── Fetch provider for email + Stripe description ──────────────────
    const { data: provider } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', provider_id)
      .single()

    const { data: seeker } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', seeker_id)
      .single()

    // ── Insert booking ─────────────────────────────────────────────────
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        provider_id,
        seeker_id,
        date_time,
        location,
        message:          message || null,
        is_public_meetup,
        total_price,
        status:           'pending',
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // ── Stripe PaymentIntent ───────────────────────────────────────────
    let clientSecret: string | null = null
    try {
      const pi = await createPaymentIntent({
        amountUsd:    total_price * 1.1,
        bookingId:    booking.id,
        providerName: provider?.full_name ?? 'Provider',
      })
      clientSecret = pi.clientSecret
    } catch (stripeErr) {
      console.warn('[bookings] Stripe PaymentIntent failed:', stripeErr)
    }

    // ── Send email to provider (fire & forget) ─────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gethumane.com'
    sendNewBookingRequestToProvider({
      providerEmail: provider?.email ?? '',
      providerName:  provider?.full_name ?? 'Provider',
      seekerName:    seeker?.full_name ?? 'Someone',
      dateTime:      date_time,
      location,
      message:       message ?? null,
      totalPrice:    total_price,
      dashboardUrl:  `${siteUrl}/dashboard`,
    }).catch(console.warn)

    return Response.json({ data: { booking, clientSecret } })
  } catch (err) {
    console.error('[/api/bookings POST]', err)
    return Response.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'bookings-get'), LIMITS.general)
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role   = searchParams.get('role') as 'provider' | 'seeker' | null

    if (!userId || !role || !['provider', 'seeker'].includes(role)) {
      return Response.json({ error: 'Missing or invalid userId/role.' }, { status: 400 })
    }

    const supabase = await createServerClient()

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

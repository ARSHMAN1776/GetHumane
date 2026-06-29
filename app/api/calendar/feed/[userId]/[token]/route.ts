import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyTokenForUser, buildIcs } from '@/lib/calendar-feed'

interface Props { params: Promise<{ userId: string; token: string }> }

export async function GET(_request: NextRequest, { params }: Props) {
  const { userId, token: rawToken } = await params
  // Strip .ics suffix if present
  const token = rawToken.replace(/\.ics$/, '')

  if (!verifyTokenForUser(userId, token)) {
    return new Response('Invalid or expired calendar link.', { status: 403 })
  }

  try {
    const supabase = await createServerClient()

    const { data: provider } = await supabase
      .from('users')
      .select('full_name, role')
      .eq('id', userId)
      .single()

    if (!provider || provider.role !== 'provider') {
      return new Response('Provider not found.', { status: 404 })
    }

    // Fetch upcoming + recent confirmed/completed bookings
    const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, date_time, location, total_price, status, seeker:users!bookings_seeker_id_fkey(full_name)')
      .eq('provider_id', userId)
      .in('status', ['confirmed', 'completed'])
      .gte('date_time', past)
      .order('date_time', { ascending: true })

    const events = (bookings ?? []).map(b => ({
      id:          b.id,
      date_time:   b.date_time,
      location:    b.location,
      seeker_name: (b.seeker as any)?.full_name ?? 'Seeker',
      total_price: b.total_price,
      status:      b.status,
    }))

    const ics = buildIcs(provider.full_name, events)

    return new Response(ics, {
      status: 200,
      headers: {
        'Content-Type':        'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="gethumane-bookings.ics"',
        'Cache-Control':       'no-cache, no-store, must-revalidate',
      },
    })
  } catch (err) {
    console.error('[/api/calendar/feed]', err)
    return new Response('Failed to generate calendar.', { status: 500 })
  }
}

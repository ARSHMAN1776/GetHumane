import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'

const CreateGroupSessionSchema = z.object({
  title:          z.string().min(3).max(100),
  skill_name:     z.string().min(2).max(80),
  description:    z.string().max(500).optional(),
  date_time:      z.string().datetime(),
  location:       z.string().min(3).max(200),
  max_capacity:   z.number().int().min(2).max(50),
  price_per_seat: z.number().min(1).max(1000),
  is_public:      z.boolean().default(true),
})

const JoinGroupSessionSchema = z.object({
  session_id: z.string().uuid(),
  seats:      z.number().int().min(1).max(10).default(1),
})

// GET /api/groups — list public group sessions
export async function GET(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'groups-get'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  const supabase = await createServerClient()
  const { searchParams } = new URL(request.url)
  const providerId = searchParams.get('providerId')

  let query = supabase
    .from('group_sessions')
    .select(`
      *,
      provider:users!group_sessions_provider_id_fkey(id, full_name, photo_url, city, is_verified),
      enrollments:group_enrollments(count)
    `)
    .eq('is_public', true)
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })

  if (providerId) query = query.eq('provider_id', providerId)

  const { data, error } = await query
  if (error) {
    console.error('[groups GET]', error)
    return Response.json({ error: 'Failed to fetch group sessions.' }, { status: 500 })
  }

  return Response.json({ data })
}

// POST /api/groups — create a group session (providers only)
export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'groups-post'), LIMITS.booking)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const body   = await request.json()
    const parsed = CreateGroupSessionSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'provider') {
      return Response.json({ error: 'Only providers can create group sessions.' }, { status: 403 })
    }

    const { data: session, error: insertErr } = await supabase
      .from('group_sessions')
      .insert({ ...parsed.data, provider_id: user.id, status: 'upcoming' })
      .select()
      .single()

    if (insertErr) throw insertErr
    return Response.json({ data: session }, { status: 201 })
  } catch (err) {
    console.error('[groups POST]', err)
    return Response.json({ error: 'Failed to create group session.' }, { status: 500 })
  }
}

// PATCH /api/groups — join a group session (seekers)
export async function PATCH(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'groups-join'), LIMITS.booking)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const body   = await request.json()
    const parsed = JoinGroupSessionSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { session_id, seats } = parsed.data

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    // Fetch session with current enrollment count
    const { data: session } = await supabase
      .from('group_sessions')
      .select('*, enrollments:group_enrollments(count)')
      .eq('id', session_id)
      .single()

    if (!session) return Response.json({ error: 'Session not found.' }, { status: 404 })
    if (session.provider_id === user.id) {
      return Response.json({ error: 'Providers cannot join their own sessions.' }, { status: 400 })
    }

    const enrolled = (session as any).enrollments?.[0]?.count ?? 0
    if (enrolled + seats > session.max_capacity) {
      return Response.json({ error: 'Not enough seats available.' }, { status: 409 })
    }

    // Check duplicate enrollment
    const { data: existing } = await supabase
      .from('group_enrollments')
      .select('id')
      .eq('session_id', session_id)
      .eq('seeker_id', user.id)
      .maybeSingle()

    if (existing) return Response.json({ error: 'You are already enrolled in this session.' }, { status: 409 })

    const totalAmount = session.price_per_seat * seats
    const { data: enrollment, error: enrollErr } = await supabase
      .from('group_enrollments')
      .insert({
        session_id,
        seeker_id:    user.id,
        seats,
        total_paid:   totalAmount,
        status:       'confirmed',
      })
      .select()
      .single()

    if (enrollErr) throw enrollErr
    return Response.json({ data: enrollment }, { status: 201 })
  } catch (err) {
    console.error('[groups PATCH]', err)
    return Response.json({ error: 'Failed to join group session.' }, { status: 500 })
  }
}

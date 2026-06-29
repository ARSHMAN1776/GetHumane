/**
 * POST /api/recurring  — create a recurring session schedule
 * GET  /api/recurring  — list current user's recurring sessions
 *
 * Requires `recurring_sessions` table:
 *   id, provider_id, seeker_id, skill_id, frequency ('weekly'|'biweekly'|'monthly'),
 *   day_of_week (0-6), time_of_day (HH:MM), location, duration_minutes,
 *   total_price_per_session, status ('active'|'paused'|'cancelled'),
 *   next_booking_date, created_at
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import { z } from 'zod'

const CreateRecurringSchema = z.object({
  provider_id:             z.string().uuid(),
  skill_id:                z.string().uuid(),
  frequency:               z.enum(['weekly', 'biweekly', 'monthly']),
  day_of_week:             z.number().int().min(0).max(6),
  time_of_day:             z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  location:                z.string().min(3).max(200),
  duration_minutes:        z.number().int().min(30).max(480),
  total_price_per_session: z.number().positive().max(10_000),
})

function nextOccurrence(dayOfWeek: number, timeOfDay: string): string {
  const now  = new Date()
  const days = (dayOfWeek - now.getDay() + 7) % 7 || 7
  const next = new Date(now)
  next.setDate(now.getDate() + days)
  const [h, m] = timeOfDay.split(':').map(Number)
  next.setHours(h, m, 0, 0)
  return next.toISOString()
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'recurring-post'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const body   = await request.json()
    const parsed = CreateRecurringSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const data = parsed.data

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    // Only seekers create recurring sessions
    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'seeker') {
      return Response.json({ error: 'Only seekers can create recurring sessions.' }, { status: 403 })
    }

    const next_booking_date = nextOccurrence(data.day_of_week, data.time_of_day)

    const { data: session, error } = await supabase
      .from('recurring_sessions')
      .insert({
        ...data,
        seeker_id:         user.id,
        status:            'active',
        next_booking_date,
      })
      .select()
      .single()

    if (error) throw error
    return Response.json({ data: session }, { status: 201 })
  } catch (err) {
    console.error('[/api/recurring POST]', err)
    return Response.json({ error: 'Failed to create recurring session.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'recurring-get'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: sessions, error } = await supabase
      .from('recurring_sessions')
      .select(`
        *,
        provider:users!recurring_sessions_provider_id_fkey(id,full_name,photo_url,city),
        seeker:users!recurring_sessions_seeker_id_fkey(id,full_name,photo_url),
        skill:skills(skill_name,hourly_rate)
      `)
      .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return Response.json({ data: sessions })
  } catch (err) {
    console.error('[/api/recurring GET]', err)
    return Response.json({ error: 'Failed to fetch recurring sessions.' }, { status: 500 })
  }
}

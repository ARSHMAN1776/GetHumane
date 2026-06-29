/**
 * GET  /api/availability?user_id=xxx  — fetch a provider's weekly schedule (public)
 * POST /api/availability              — save/update the authenticated provider's schedule
 *
 * Schedule is an array of 7 objects, one per day (0=Sun … 6=Sat):
 *   { day_of_week, start_time, end_time, is_available }
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import { z } from 'zod'

const DaySchema = z.object({
  day_of_week:  z.number().int().min(0).max(6),
  start_time:   z.string().regex(/^\d{2}:\d{2}$/),
  end_time:     z.string().regex(/^\d{2}:\d{2}$/),
  is_available: z.boolean(),
})

const SaveSchema = z.array(DaySchema).length(7)

export async function GET(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'availability-get'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  const userId = new URL(request.url).searchParams.get('user_id')
  if (!userId) return Response.json({ error: 'user_id required.' }, { status: 400 })

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time, is_available')
    .eq('user_id', userId)
    .order('day_of_week')

  if (error) return Response.json({ error: 'Failed to fetch availability.' }, { status: 500 })

  // If no rows yet, return default schedule (all days off, 9am-6pm)
  if (!data || data.length === 0) {
    const defaults = Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: '09:00',
      end_time: '18:00',
      is_available: i >= 1 && i <= 5, // Mon-Fri available by default
    }))
    return Response.json({ data: defaults })
  }

  return Response.json({ data })
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'availability-post'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const body   = await request.json()
    const parsed = SaveSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const rows = parsed.data.map(d => ({ ...d, user_id: user.id }))

    // Upsert all 7 days at once
    const { error } = await supabase
      .from('availability')
      .upsert(rows, { onConflict: 'user_id,day_of_week' })

    if (error) throw error

    return Response.json({ data: { message: 'Availability saved.' } })
  } catch (err) {
    console.error('[/api/availability POST]', err)
    return Response.json({ error: 'Failed to save availability.' }, { status: 500 })
  }
}

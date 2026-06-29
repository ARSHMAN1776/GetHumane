import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { ReportSchema } from '@/lib/validations'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'report'), LIMITS.general)
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
  }

  try {
    const body   = await request.json()
    const parsed = ReportSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { reported_user_id, reason } = parsed.data

    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'You must be logged in to report a user.' }, { status: 401 })
    }

    if (user.id === reported_user_id) {
      return Response.json({ error: 'You cannot report yourself.' }, { status: 400 })
    }

    const { data: reportedUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', reported_user_id)
      .single()

    if (!reportedUser) {
      return Response.json({ error: 'User not found.' }, { status: 404 })
    }

    // Prevent duplicate reports from same user
    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('reported_user_id', reported_user_id)
      .maybeSingle()

    if (existing) {
      return Response.json(
        { error: 'You have already reported this user. Our team is reviewing it.' },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id:      user.id,
      reported_user_id,
      reason,
    })

    if (error) throw error

    return Response.json({ data: { message: 'Report submitted. Our safety team will review it within 24 hours.' } })
  } catch (err) {
    console.error('[/api/report POST]', err)
    return Response.json({ error: 'Failed to submit report. Please try again.' }, { status: 500 })
  }
}

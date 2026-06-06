/**
 * app/api/report/route.ts
 * POST /api/report — logs a user report to the reports table.
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body               = await request.json()
    const { reported_user_id, reason } = body

    if (!reported_user_id || !reason) {
      return Response.json(
        { error: 'Missing required fields: reported_user_id, reason.' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Must be authenticated to file a report
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'You must be logged in to report a user.' }, { status: 401 })
    }

    // Can't report yourself
    if (user.id === reported_user_id) {
      return Response.json({ error: 'You cannot report yourself.' }, { status: 400 })
    }

    // Check reported user exists
    const { data: reportedUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', reported_user_id)
      .single()

    if (!reportedUser) {
      return Response.json({ error: 'User not found.' }, { status: 404 })
    }

    // Insert the report
    const { error } = await supabase.from('reports').insert({
      reporter_id:      user.id,
      reported_user_id,
      reason,
    })

    if (error) throw error

    return Response.json({ data: { message: 'Report submitted. Our safety team will review it.' } })
  } catch (err) {
    console.error('[/api/report POST]', err)
    return Response.json(
      { error: 'Failed to submit report. Please try again.' },
      { status: 500 }
    )
  }
}

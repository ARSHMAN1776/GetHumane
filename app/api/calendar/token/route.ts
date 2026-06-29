import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { tokenForUser } from '@/lib/calendar-feed'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const token  = tokenForUser(user.id)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const feedUrl = `${appUrl}/api/calendar/feed/${user.id}/${token}.ics`

    return Response.json({ data: { feedUrl, token } })
  } catch (err) {
    console.error('[/api/calendar/token]', err)
    return Response.json({ error: 'Failed to generate feed URL.' }, { status: 500 })
  }
}

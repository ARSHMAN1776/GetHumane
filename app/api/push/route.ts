/**
 * app/api/push/route.ts
 * Web Push subscription management.
 * POST: save push subscription for user
 * DELETE: remove push subscription
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'

// POST /api/push — save a push subscription
export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'push-post'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const subscription = await request.json()
    if (!subscription?.endpoint) {
      return Response.json({ error: 'Invalid push subscription.' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id:      user.id,
      endpoint:     subscription.endpoint,
      p256dh:       subscription.keys?.p256dh ?? null,
      auth:         subscription.keys?.auth ?? null,
      user_agent:   request.headers.get('user-agent') ?? null,
    }, { onConflict: 'endpoint' })

    if (error) throw error
    return Response.json({ data: { message: 'Push subscription saved.' } })
  } catch (err) {
    console.error('[/api/push POST]', err)
    return Response.json({ error: 'Failed to save push subscription.' }, { status: 500 })
  }
}

// DELETE /api/push — remove a push subscription
export async function DELETE(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'push-delete'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const { endpoint } = await request.json()
    if (!endpoint) return Response.json({ error: 'Missing endpoint.' }, { status: 400 })

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id)

    return Response.json({ data: { message: 'Push subscription removed.' } })
  } catch (err) {
    console.error('[/api/push DELETE]', err)
    return Response.json({ error: 'Failed to remove subscription.' }, { status: 500 })
  }
}

// GET /api/push/vapid — return VAPID public key for client subscription
export async function GET() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidPublicKey) return Response.json({ error: 'Push notifications not configured.' }, { status: 503 })
  return Response.json({ data: { vapidPublicKey } })
}

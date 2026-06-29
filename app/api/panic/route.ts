/**
 * POST /api/panic
 * Safety panic button — sends an SMS alert via Twilio to our safety team
 * AND to the user's emergency contact (if set on their profile).
 *
 * Add to .env.local:
 *   TWILIO_ACCOUNT_SID=ACxxxx
 *   TWILIO_AUTH_TOKEN=xxxx
 *   TWILIO_FROM_NUMBER=+1xxxxxxxxxx
 *   SAFETY_TEAM_NUMBER=+1xxxxxxxxxx
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey } from '@/lib/ratelimit'
import { z } from 'zod'

const PanicSchema = z.object({
  booking_id: z.string().uuid().optional(),
  location:   z.string().max(300).optional(),
  message:    z.string().max(500).optional(),
})

async function sendSMS(to: string, body: string) {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) return

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  })
}

export async function POST(request: NextRequest) {
  // Strict rate limit — 2 panic calls per 5 minutes per IP
  const rl = rateLimit(getRateLimitKey(request, 'panic'), { limit: 2, windowMs: 5 * 60_000 })
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const body   = await request.json()
    const parsed = PanicSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { booking_id, location, message } = parsed.data

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('full_name, phone, emergency_contact_phone')
      .eq('id', user.id)
      .single()

    const smsBody = [
      `🚨 GetHumane PANIC ALERT`,
      `User: ${profile?.full_name ?? user.email}`,
      location ? `Location: ${location}` : null,
      booking_id ? `Booking: ${booking_id}` : null,
      message ? `Message: ${message}` : null,
      `Time: ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n')

    const targets: string[] = []
    if (process.env.SAFETY_TEAM_NUMBER) targets.push(process.env.SAFETY_TEAM_NUMBER)
    if (profile?.emergency_contact_phone) targets.push(profile.emergency_contact_phone)

    await Promise.allSettled(targets.map((t) => sendSMS(t, smsBody)))

    // Log panic event in DB
    void supabase.from('panic_events').insert({
      user_id:    user.id,
      booking_id: booking_id ?? null,
      location:   location   ?? null,
      message:    message    ?? null,
    })

    return Response.json({ data: { message: 'Help is on the way. Stay safe.' } })
  } catch (err) {
    console.error('[/api/panic]', err)
    return Response.json({ error: 'Failed to send alert. Call 911 immediately if in danger.' }, { status: 500 })
  }
}

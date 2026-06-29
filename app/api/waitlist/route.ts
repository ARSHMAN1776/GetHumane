import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { WaitlistSchema } from '@/lib/validations'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import { sendWaitlistWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'waitlist'), LIMITS.waitlist)
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
  }

  try {
    const body   = await request.json()
    const parsed = WaitlistSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const email = parsed.data.email.toLowerCase()

    const supabase = await createServerClient()

    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return Response.json(
        { error: 'This email is already on our waitlist!' },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('waitlist').insert({ email })
    if (error) throw error

    sendWaitlistWelcomeEmail({ email }).catch(console.warn)

    return Response.json(
      { data: { message: "You're on the list! We'll notify you at launch." } },
      { status: 201 }
    )
  } catch (err) {
    console.error('[/api/waitlist POST]', err)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'

// GET /api/referral — get my referral code + stats
export async function GET(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'referral-get'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

  // Fetch or auto-generate referral code from users table
  const { data: profile } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  let referralCode = (profile as any)?.referral_code as string | null

  if (!referralCode) {
    // Generate a unique 8-char alphanumeric code
    referralCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    await supabase.from('users').update({ referral_code: referralCode }).eq('id', user.id)
  }

  // Count referrals
  const { count: referralCount } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', user.id)

  const { count: convertedCount } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', user.id)
    .eq('status', 'converted')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gethumane.com'

  return Response.json({
    data: {
      referralCode,
      referralLink: `${siteUrl}/signup?ref=${referralCode}`,
      totalReferrals: referralCount ?? 0,
      convertedReferrals: convertedCount ?? 0,
      creditsEarned: (convertedCount ?? 0) * 10,
    }
  })
}

// POST /api/referral — apply a referral code at signup
export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'referral-post'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const { referral_code } = await request.json()
    if (!referral_code) return Response.json({ error: 'Missing referral_code.' }, { status: 400 })

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    // Find the referrer
    const { data: referrer } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referral_code.toUpperCase())
      .single()

    if (!referrer) return Response.json({ error: 'Invalid referral code.' }, { status: 404 })
    if (referrer.id === user.id) return Response.json({ error: 'Cannot use your own referral code.' }, { status: 400 })

    // Check if already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referee_id', user.id)
      .maybeSingle()

    if (existing) return Response.json({ error: 'You have already applied a referral code.' }, { status: 409 })

    // Record the referral
    const { error: insertErr } = await supabase.from('referrals').insert({
      referrer_id: referrer.id,
      referee_id:  user.id,
      status:      'pending',
      credit_amount: 10,
    })
    if (insertErr) throw insertErr

    // Give both users $10 credit
    await Promise.all([
      supabase.from('users').update({ credit_balance: supabase.rpc('increment', { x: 10, user_id: referrer.id }) as any }).eq('id', referrer.id),
      supabase.from('users').update({ credit_balance: supabase.rpc('increment', { x: 10, user_id: user.id }) as any }).eq('id', user.id),
    ])

    // Mark as converted
    await supabase.from('referrals').update({ status: 'converted' }).eq('referee_id', user.id)

    return Response.json({ data: { message: 'Referral applied! You both earned $10 credit.' } })
  } catch (err) {
    console.error('[/api/referral POST]', err)
    return Response.json({ error: 'Failed to apply referral code.' }, { status: 500 })
  }
}

/**
 * POST /api/subscription/checkout  — create Stripe Checkout for Provider Pro
 * GET  /api/subscription            — get current subscription status
 *
 * Provider Pro ($19/month):
 *   - Featured listing (appears first in browse)
 *   - Analytics dashboard
 *   - Priority support badge
 *   - Verified Pro badge
 *
 * Requires on users table:
 *   stripe_customer_id text, subscription_status text, subscription_end_at timestamptz, is_pro boolean
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID ?? ''

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'subscription'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name, email, stripe_customer_id, is_pro')
      .eq('id', user.id)
      .single()

    if (!profile) return Response.json({ error: 'Profile not found.' }, { status: 404 })
    if (profile.role !== 'provider') {
      return Response.json({ error: 'Provider Pro is only available for providers.' }, { status: 400 })
    }
    if (profile.is_pro) {
      return Response.json({ error: 'You already have Provider Pro.' }, { status: 409 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gethumane.com'

    // Create or reuse Stripe customer
    let customerId = profile.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    profile.email,
        name:     profile.full_name,
        metadata: { user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer:             customerId,
      mode:                 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price:    PRO_PRICE_ID,
        quantity: 1,
      }],
      success_url: `${siteUrl}/dashboard?pro=1`,
      cancel_url:  `${siteUrl}/dashboard/settings`,
      metadata:    { user_id: user.id },
      subscription_data: {
        metadata: { user_id: user.id },
        trial_period_days: 14,
      },
    })

    return Response.json({ data: { url: session.url } })
  } catch (err) {
    console.error('[/api/subscription POST]', err)
    return Response.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'subscription-get'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('is_pro, subscription_status, subscription_end_at')
      .eq('id', user.id)
      .single()

    return Response.json({ data: profile })
  } catch (err) {
    console.error('[/api/subscription GET]', err)
    return Response.json({ error: 'Failed to fetch subscription.' }, { status: 500 })
  }
}

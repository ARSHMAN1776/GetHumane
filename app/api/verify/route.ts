/**
 * POST /api/verify
 * Initiates identity verification for a provider.
 * Uses Stripe Identity (VerificationSession) — the industry standard.
 * Provider uploads a selfie + government ID; Stripe verifies within seconds.
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'verify'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users').select('role, is_verified, full_name').eq('id', user.id).single()

    if (!profile) return Response.json({ error: 'Profile not found.' }, { status: 404 })
    if (profile.role !== 'provider') {
      return Response.json({ error: 'Only providers can get verified.' }, { status: 400 })
    }
    if (profile.is_verified) {
      return Response.json({ error: 'You are already verified.' }, { status: 409 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gethumane.com'

    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { user_id: user.id },
      options: {
        document: {
          allowed_types: ['driving_license', 'passport', 'id_card'],
          require_id_number: false,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
      return_url: `${siteUrl}/dashboard/settings?verified=1`,
    })

    return Response.json({ data: { url: session.url, sessionId: session.id } })
  } catch (err) {
    console.error('[/api/verify]', err)
    return Response.json({ error: 'Failed to start verification. Please try again.' }, { status: 500 })
  }
}

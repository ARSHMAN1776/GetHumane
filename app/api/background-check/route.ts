/**
 * app/api/background-check/route.ts
 * Checkr background check integration.
 * Initiates a background check for a provider and stores the Checkr report ID.
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'

const CHECKR_API_KEY = process.env.CHECKR_API_KEY
const CHECKR_BASE    = 'https://api.checkr.com/v1'

async function checkrRequest(path: string, method = 'GET', body?: object) {
  if (!CHECKR_API_KEY) throw new Error('CHECKR_API_KEY not configured')
  const res = await fetch(`${CHECKR_BASE}${path}`, {
    method,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${CHECKR_API_KEY}:`).toString('base64'),
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Checkr API error ${res.status}: ${text}`)
  }
  return res.json()
}

// POST /api/background-check — initiate a background check
export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'bgcheck-post'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name, email, background_check_status')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'provider') {
      return Response.json({ error: 'Background checks are for providers only.' }, { status: 403 })
    }

    if ((profile as any).background_check_status === 'clear') {
      return Response.json({ error: 'Your background check is already complete.' }, { status: 409 })
    }

    if (!CHECKR_API_KEY) {
      // Sandbox mode: simulate a pending check
      await supabase.from('users').update({ background_check_status: 'pending' }).eq('id', user.id)
      return Response.json({
        data: {
          status: 'pending',
          message: 'Background check initiated (sandbox mode). Results typically take 1-3 business days.',
        }
      })
    }

    // Create or find Checkr candidate
    const [firstName, ...rest] = (profile?.full_name ?? 'Unknown User').split(' ')
    const lastName = rest.join(' ') || firstName

    const candidate = await checkrRequest('/candidates', 'POST', {
      first_name: firstName,
      last_name:  lastName,
      email:      profile?.email ?? user.email,
      metadata:   { user_id: user.id },
    })

    // Create an invitation (sends email to candidate to fill SSN, etc.)
    const invitation = await checkrRequest('/invitations', 'POST', {
      candidate_id: candidate.id,
      package:      'tasker_standard',
      work_locations: [{ country: 'US' }],
    })

    // Store Checkr candidate ID and mark as pending
    await supabase.from('users').update({
      checkr_candidate_id:   candidate.id,
      background_check_status: 'pending',
    }).eq('id', user.id)

    return Response.json({
      data: {
        status:      'pending',
        invitationUrl: invitation.invitation_url,
        message:     'Background check invitation sent. Check your email to complete the process.',
      }
    })
  } catch (err) {
    console.error('[/api/background-check POST]', err)
    return Response.json({ error: 'Failed to initiate background check.' }, { status: 500 })
  }
}

// GET /api/background-check — get background check status
export async function GET(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'bgcheck-get'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('background_check_status, checkr_candidate_id')
    .eq('id', user.id)
    .single()

  return Response.json({
    data: {
      status:      (profile as any)?.background_check_status ?? 'not_started',
      candidateId: (profile as any)?.checkr_candidate_id ?? null,
    }
  })
}

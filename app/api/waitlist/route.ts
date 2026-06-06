/**
 * app/api/waitlist/route.ts
 * POST /api/waitlist — validates email and inserts into the waitlist table.
 * Returns 409 Conflict when email already exists.
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json()
    const email = (body.email as string)?.trim().toLowerCase()

    // ── Validate ────────────────────────────────────────────────────────────
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // ── Duplicate check ─────────────────────────────────────────────────────
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

    // ── Insert ──────────────────────────────────────────────────────────────
    const { error } = await supabase
      .from('waitlist')
      .insert({ email })

    if (error) throw error

    return Response.json(
      { data: { message: "You're on the list! We'll notify you at launch." } },
      { status: 201 }
    )
  } catch (err) {
    console.error('[/api/waitlist POST]', err)
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

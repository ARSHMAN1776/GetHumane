/**
 * PATCH /api/dispute/[id] — Admin resolves a dispute (approve refund or close)
 *
 * Body: { decision: 'refund' | 'close', resolution_note: string }
 * - 'refund'  → cancels payment intent (returns funds to seeker), marks booking cancelled
 * - 'close'   → closes dispute without refund (provider is paid on next capture)
 *
 * Protected: admin emails only (ADMIN_EMAILS env var)
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cancelPaymentIntent } from '@/lib/stripe'
import { z } from 'zod'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

const ResolveSchema = z.object({
  decision:        z.enum(['refund', 'close']),
  resolution_note: z.string().min(5).max(1000),
})

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
      return Response.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const body   = await request.json()
    const parsed = ResolveSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { decision, resolution_note } = parsed.data

    // Fetch the dispute + booking
    const { data: dispute } = await supabase
      .from('disputes')
      .select('id, booking_id, status')
      .eq('id', id)
      .single()

    if (!dispute) return Response.json({ error: 'Dispute not found.' }, { status: 404 })
    if (dispute.status !== 'open') {
      return Response.json({ error: 'Dispute is already resolved.' }, { status: 409 })
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, stripe_payment_intent_id, provider_id, seeker_id')
      .eq('id', dispute.booking_id)
      .single()

    if (!booking) return Response.json({ error: 'Booking not found.' }, { status: 404 })

    // Process decision
    if (decision === 'refund' && booking.stripe_payment_intent_id) {
      await cancelPaymentIntent(booking.stripe_payment_intent_id)
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
    } else if (decision === 'close') {
      await supabase.from('bookings').update({ status: 'completed' }).eq('id', booking.id)
    }

    // Mark dispute resolved
    await supabase.from('disputes').update({
      status:          'resolved',
      resolved_by:     user.id,
      resolved_at:     new Date().toISOString(),
      resolution_note,
      refund_issued:   decision === 'refund',
    }).eq('id', id)

    console.log(`[dispute/${id}] Resolved by ${user.email}: ${decision}`)
    return Response.json({ data: { message: `Dispute resolved — ${decision}.` } })
  } catch (err) {
    console.error(`[/api/dispute/${id} PATCH]`, err)
    return Response.json({ error: 'Failed to resolve dispute.' }, { status: 500 })
  }
}

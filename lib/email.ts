/**
 * lib/email.ts
 * Transactional email via Resend.
 * Set RESEND_API_KEY in .env.local — get one free at resend.com
 */

import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
  return _resend
}
const FROM = process.env.EMAIL_FROM ?? 'GetHumane <noreply@gethumane.com>'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

// ─── Booking Confirmation (to Seeker) ────────────────────────────────────────

export async function sendBookingConfirmedToSeeker(opts: {
  seekerEmail: string
  seekerName: string
  providerName: string
  dateTime: string
  location: string
  totalPrice: number
}) {
  if (!process.env.RESEND_API_KEY) return

  await getResend().emails.send({
    from:    FROM,
    to:      opts.seekerEmail,
    subject: `Booking confirmed with ${opts.providerName} — GetHumane`,
    html: `
      <div style="font-family:'Plus Jakarta Sans',Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111827">
        <div style="margin-bottom:24px">
          <span style="background:#0f766e;color:white;padding:6px 14px;border-radius:8px;font-weight:700;font-size:13px">GetHumane</span>
        </div>
        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">Your session is confirmed! 🎉</h1>
        <p style="color:#6b7280;margin:0 0 24px">Hi ${opts.seekerName}, your booking with ${opts.providerName} is all set.</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Session Details</p>
          <p style="margin:0 0 6px"><strong>Provider:</strong> ${opts.providerName}</p>
          <p style="margin:0 0 6px"><strong>Date & Time:</strong> ${formatDate(opts.dateTime)}</p>
          <p style="margin:0 0 6px"><strong>Location:</strong> ${opts.location}</p>
          <p style="margin:0"><strong>Total:</strong> $${opts.totalPrice.toFixed(2)}</p>
        </div>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#166534;font-size:14px">
            <strong>🛡️ Safety reminder:</strong> Meet only at a public location. Share your meetup details with a friend.
          </p>
        </div>

        <p style="color:#9ca3af;font-size:12px;margin:0">
          This email was sent by GetHumane. If you have concerns, reply to this email or visit our safety page.
        </p>
      </div>
    `,
  })
}

// ─── New Booking Request (to Provider) ───────────────────────────────────────

export async function sendNewBookingRequestToProvider(opts: {
  providerEmail: string
  providerName: string
  seekerName: string
  dateTime: string
  location: string
  message: string | null
  totalPrice: number
  dashboardUrl: string
}) {
  if (!process.env.RESEND_API_KEY) return

  await getResend().emails.send({
    from:    FROM,
    to:      opts.providerEmail,
    subject: `New booking request from ${opts.seekerName} — GetHumane`,
    html: `
      <div style="font-family:'Plus Jakarta Sans',Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111827">
        <div style="margin-bottom:24px">
          <span style="background:#0f766e;color:white;padding:6px 14px;border-radius:8px;font-weight:700;font-size:13px">GetHumane</span>
        </div>
        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">New booking request! 📩</h1>
        <p style="color:#6b7280;margin:0 0 24px">Hi ${opts.providerName}, ${opts.seekerName} wants to book a session with you.</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Request Details</p>
          <p style="margin:0 0 6px"><strong>From:</strong> ${opts.seekerName}</p>
          <p style="margin:0 0 6px"><strong>Requested Time:</strong> ${formatDate(opts.dateTime)}</p>
          <p style="margin:0 0 6px"><strong>Location:</strong> ${opts.location}</p>
          <p style="margin:0 0 6px"><strong>You'll Earn:</strong> $${(opts.totalPrice * 0.9).toFixed(2)} (after 10% platform fee)</p>
          ${opts.message ? `<p style="margin:12px 0 0;padding-top:12px;border-top:1px solid #e5e7eb"><strong>Message:</strong> ${opts.message}</p>` : ''}
        </div>

        <a href="${opts.dashboardUrl}" style="display:inline-block;background:#0f766e;color:white;padding:12px 24px;border-radius:10px;font-weight:700;text-decoration:none;margin-bottom:24px">
          View &amp; Respond →
        </a>

        <p style="color:#9ca3af;font-size:12px;margin:0">Respond within 24 hours to maintain a high response rate.</p>
      </div>
    `,
  })
}

// ─── Booking Cancelled ────────────────────────────────────────────────────────

export async function sendBookingCancelledEmail(opts: {
  recipientEmail: string
  recipientName: string
  otherPartyName: string
  dateTime: string
}) {
  if (!process.env.RESEND_API_KEY) return

  await getResend().emails.send({
    from:    FROM,
    to:      opts.recipientEmail,
    subject: `Booking cancelled — GetHumane`,
    html: `
      <div style="font-family:'Plus Jakarta Sans',Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111827">
        <div style="margin-bottom:24px">
          <span style="background:#0f766e;color:white;padding:6px 14px;border-radius:8px;font-weight:700;font-size:13px">GetHumane</span>
        </div>
        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">Booking cancelled</h1>
        <p style="color:#6b7280;margin:0 0 24px">
          Hi ${opts.recipientName}, your session with ${opts.otherPartyName} on ${formatDate(opts.dateTime)} has been cancelled.
        </p>
        <p style="color:#9ca3af;font-size:12px">Questions? Reply to this email.</p>
      </div>
    `,
  })
}

// ─── Session Completed — Leave a Review ──────────────────────────────────────

export async function sendLeaveReviewEmail(opts: {
  seekerEmail: string
  seekerName: string
  providerName: string
  providerId: string
  siteUrl: string
}) {
  if (!process.env.RESEND_API_KEY) return

  await getResend().emails.send({
    from:    FROM,
    to:      opts.seekerEmail,
    subject: `How was your session with ${opts.providerName}? — GetHumane`,
    html: `
      <div style="font-family:'Plus Jakarta Sans',Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111827">
        <div style="margin-bottom:24px">
          <span style="background:#0f766e;color:white;padding:6px 14px;border-radius:8px;font-weight:700;font-size:13px">GetHumane</span>
        </div>
        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">How was your session? ⭐</h1>
        <p style="color:#6b7280;margin:0 0 24px">
          Hi ${opts.seekerName}, your session with ${opts.providerName} is complete. Leave them a review — it only takes 30 seconds and helps our community!
        </p>
        <a href="${opts.siteUrl}/provider/${opts.providerId}" style="display:inline-block;background:#0f766e;color:white;padding:12px 24px;border-radius:10px;font-weight:700;text-decoration:none">
          Leave a Review →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">Thank you for being part of GetHumane.</p>
      </div>
    `,
  })
}

// ─── Waitlist Welcome ─────────────────────────────────────────────────────────

export async function sendWaitlistWelcomeEmail(opts: { email: string }) {
  if (!process.env.RESEND_API_KEY) return

  await getResend().emails.send({
    from:    FROM,
    to:      opts.email,
    subject: `You're on the GetHumane waitlist! 🎉`,
    html: `
      <div style="font-family:'Plus Jakarta Sans',Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111827">
        <div style="margin-bottom:24px">
          <span style="background:#0f766e;color:white;padding:6px 14px;border-radius:8px;font-weight:700;font-size:13px">GetHumane</span>
        </div>
        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">You're on the list! 🎉</h1>
        <p style="color:#6b7280;margin:0 0 24px">
          Thanks for joining the GetHumane waitlist. We're building the world's most human skill-sharing platform — a place where real people teach real skills in real life.
        </p>
        <p style="color:#6b7280;margin:0 0 24px">
          We'll email you the moment we launch in your city. In the meantime, tell a friend — the more people who join, the faster we grow.
        </p>
        <p style="color:#9ca3af;font-size:12px">— The GetHumane team</p>
      </div>
    `,
  })
}

import { createHmac } from 'crypto'

// ─── Token ────────────────────────────────────────────────────────────────────

const secret = () => {
  const s = process.env.CALENDAR_FEED_SECRET
  if (!s) throw new Error('CALENDAR_FEED_SECRET env var is not set')
  return s
}

export function tokenForUser(userId: string): string {
  return createHmac('sha256', secret()).update(userId).digest('hex')
}

export function verifyToken(token: string): string | null {
  // We can't reverse HMAC, so we can't get userId from token directly.
  // The feed route must receive userId as a param and verify the token matches.
  // Instead we embed the userId in the URL: /api/calendar/feed/[userId]/[token].ics
  // This function is kept for reference — verification happens in the route.
  return null
}

export function verifyTokenForUser(userId: string, token: string): boolean {
  const expected = tokenForUser(userId)
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== token.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i)
  }
  return diff === 0
}

// ─── ICS builder ─────────────────────────────────────────────────────────────

function icsDate(iso: string): string {
  // Convert ISO string → ICS UTC format: 20260629T140000Z
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export interface CalendarBooking {
  id: string
  date_time: string
  location: string
  seeker_name: string
  total_price: number
  status: string
}

export function buildIcs(providerName: string, bookings: CalendarBooking[]): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gethumane.com'
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GetHumane//Bookings Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:GetHumane — ${escapeIcs(providerName)}`,
    'X-WR-TIMEZONE:UTC',
  ]

  for (const b of bookings) {
    const start = new Date(b.date_time)
    const end   = new Date(start.getTime() + 60 * 60 * 1000) // 1 hr default

    lines.push(
      'BEGIN:VEVENT',
      `UID:booking-${b.id}@gethumane.com`,
      `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${icsDate(start.toISOString())}`,
      `DTEND:${icsDate(end.toISOString())}`,
      `SUMMARY:Session with ${escapeIcs(b.seeker_name)}`,
      `LOCATION:${escapeIcs(b.location)}`,
      `DESCRIPTION:Total: $${b.total_price}\\nBooking ID: ${b.id}\\nManage: ${appUrl}/dashboard`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

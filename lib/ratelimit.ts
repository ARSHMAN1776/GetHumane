/**
 * lib/ratelimit.ts
 * Simple in-memory sliding-window rate limiter.
 * Works for single-instance deployments (Vercel edge functions need Upstash).
 */

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

interface RateLimitOptions {
  /** Max requests allowed per window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export function rateLimit(key: string, opts: RateLimitOptions): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { allowed: true, remaining: opts.limit - 1 }
  }

  if (existing.count >= opts.limit) {
    return { allowed: false, remaining: 0 }
  }

  existing.count++
  return { allowed: true, remaining: opts.limit - existing.count }
}

/** Derive a rate-limit key from the request (IP + route) */
export function getRateLimitKey(request: Request, route: string): string {
  const ip =
    (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    (request.headers.get('x-real-ip') ?? '') ||
    'unknown'
  return `${route}:${ip}`
}

/** Standard limits per route type */
export const LIMITS = {
  booking:  { limit: 10, windowMs: 60_000 },   // 10 bookings/min per IP
  auth:     { limit: 5,  windowMs: 60_000 },    // 5 auth attempts/min
  general:  { limit: 30, windowMs: 60_000 },    // 30 general requests/min
  waitlist: { limit: 3,  windowMs: 60_000 },    // 3 waitlist signups/min
}

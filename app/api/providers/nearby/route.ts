/**
 * GET /api/providers/nearby?lat=xx&lng=xx&radius=25&skill=guitar&limit=20
 *
 * Uses PostGIS ST_DWithin on Supabase to find providers within radius (km).
 * Requires `location` column (geography) on users table.
 *
 * SQL to add: ALTER TABLE users ADD COLUMN location geography(Point, 4326);
 *             CREATE INDEX users_location_idx ON users USING GIST(location);
 * Update on signup/settings: ST_SetSRID(ST_MakePoint(lng, lat), 4326)
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'

export async function GET(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'nearby'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const params  = new URL(request.url).searchParams
    const lat     = parseFloat(params.get('lat')    ?? '')
    const lng     = parseFloat(params.get('lng')    ?? '')
    const radius  = Math.min(parseFloat(params.get('radius') ?? '25'), 100) // km, max 100
    const skill   = params.get('skill')  ?? ''
    const limit   = Math.min(parseInt(params.get('limit')  ?? '20'), 50)

    if (isNaN(lat) || isNaN(lng)) {
      return Response.json({ error: 'lat and lng are required.' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // PostGIS RPC — call a Supabase DB function
    const { data, error } = await supabase.rpc('providers_within_radius', {
      user_lat:   lat,
      user_lng:   lng,
      radius_km:  radius,
      skill_filter: skill || null,
      result_limit: limit,
    })

    if (error) {
      // Fallback: city-based search if PostGIS not yet set up
      console.warn('[nearby] PostGIS RPC failed, falling back to city match:', error.message)
      const { data: fallback } = await supabase
        .from('users')
        .select('id, full_name, photo_url, city, is_verified, bio, skills(*)')
        .eq('role', 'provider')
        .limit(limit)
      return Response.json({ data: fallback ?? [], source: 'city_fallback' })
    }

    return Response.json({ data: data ?? [], source: 'postgis' })
  } catch (err) {
    console.error('[/api/providers/nearby]', err)
    return Response.json({ error: 'Search failed.' }, { status: 500 })
  }
}

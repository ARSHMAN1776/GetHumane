/**
 * lib/supabase.ts
 * Supabase client factories for GetHumane.
 *
 * IMPORTANT ARCHITECTURE NOTE:
 * - createBrowserClient()  → Client Components ('use client') ONLY
 * - createServerClient()   → Server Components, Route Handlers, middleware ONLY
 *
 * The server client lazily imports `next/headers` inside the function body
 * so this file can be safely imported by both browser and server modules.
 */

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cache } from 'react'

// ─── Environment variables ────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Cache the browser client instance to prevent multiple client instantiations
let globalBrowserClient: ReturnType<typeof _createBrowserClient> | null = null

// ─── Browser Client ────────────────────────────────────────────────────────────
/**
 * Use in Client Components ('use client').
 * Memoizes the browser client instance to prevent memory leaks and multiple
 * active connection/auth loops.
 */
export function createBrowserClient() {
  if (typeof window === 'undefined') {
    return _createBrowserClient(
      SUPABASE_URL || 'https://placeholder.supabase.co',
      SUPABASE_ANON_KEY || 'placeholder-anon-key'
    )
  }

  if (!globalBrowserClient) {
    globalBrowserClient = _createBrowserClient(
      SUPABASE_URL || 'https://placeholder.supabase.co',
      SUPABASE_ANON_KEY || 'placeholder-anon-key'
    )
  }

  return globalBrowserClient
}

// ─── Server Client ─────────────────────────────────────────────────────────────
export const createServerClient = cache(async () => {
  // Dynamic import keeps `next/headers` out of the browser bundle
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return _createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a read-only Server Component context — safe to ignore.
          // Middleware handles session refresh in that case.
        }
      },
    },
  })
})

// ─── Convenience: get current user profile ────────────────────────────────────
/**
 * Returns the current user's row from public.users, or null if not authenticated.
 * Server-only — do not call from Client Components.
 * Wrapped in React's cache() to memoize the database/auth query per-request.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
})


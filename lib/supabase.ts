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

// ─── Environment variables ────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// ─── Browser Client ────────────────────────────────────────────────────────────
/**
 * Use in Client Components ('use client').
 * Safe to call multiple times — @supabase/ssr memoises the instance.
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return _createBrowserClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-anon-key'
  )
}

// ─── Server Client ─────────────────────────────────────────────────────────────
/**
 * Use in Server Components, Route Handlers, or middleware.
 *
 * `next/headers` is imported dynamically inside this function so this module
 * can be bundled for the browser without crashing (the browser path never
 * calls createServerClient).
 */
export async function createServerClient() {
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
}

// ─── Convenience: get current user profile ────────────────────────────────────
/**
 * Returns the current user's row from public.users, or null if not authenticated.
 * Server-only — do not call from Client Components.
 */
export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

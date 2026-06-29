/**
 * lib/env.ts — Environment variable validation.
 * Import this at the top of any server-side module that needs guaranteed vars.
 * Call `validateEnv()` once at startup (e.g., in instrumentation.ts).
 */

export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`[env] Missing required environment variable: ${key}`)
  return value
}

export function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback
}

/** Call once at server startup — throws if any critical var is absent. */
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_SITE_URL',
  ]

  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `[startup] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nCheck your .env.local file or deployment config.`
    )
  }
}

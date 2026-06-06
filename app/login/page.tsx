'use client'

/**
 * app/login/page.tsx — Login Page
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2, ArrowRight, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createBrowserClient()

  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email    = formData.get('email') as string
    const password = formData.get('password') as string

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Password Reset ────────────────────────────────────────────────────────
  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email    = formData.get('email') as string

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error

      setResetSent(true)
      toast.success('Password reset email sent!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">

        {/* ── Logo ────────────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-gray-900 mb-6">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white">
              <Heart size={18} fill="white" />
            </span>
            Get<span className="text-brand-600">Humane</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {resetMode ? 'Reset Password' : 'Welcome back'}
          </h1>
          <p className="text-gray-500">
            {resetMode
              ? 'Enter your email to receive a reset link.'
              : "Sign in to your account"}
          </p>
        </div>

        <div className="card p-8">

          {/* ── Login Form ─────────────────────────────────────────────────── */}
          {!resetMode && (
            <form onSubmit={handleLogin} className="space-y-5" id="login-form">
              <div>
                <label htmlFor="login-email" className="label">
                  <Mail size={13} className="inline mr-1.5" />Email Address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="label mb-0">
                    <Lock size={13} className="inline mr-1.5" />Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-xs text-brand-600 hover:underline font-medium"
                    id="forgot-password-btn"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input"
                  placeholder="Your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base"
                id="login-submit"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}

          {/* ── Password Reset Form ───────────────────────────────────────── */}
          {resetMode && !resetSent && (
            <form onSubmit={handlePasswordReset} className="space-y-5" id="reset-form">
              <div>
                <label htmlFor="reset-email" className="label">
                  <Mail size={13} className="inline mr-1.5" />Email Address
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="jane@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base"
                id="reset-submit"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  <>Send Reset Link <ArrowRight size={18} /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to login
              </button>
            </form>
          )}

          {/* ── Reset Sent State ──────────────────────────────────────────── */}
          {resetMode && resetSent && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Mail size={26} className="text-emerald-600" />
              </div>
              <p className="font-semibold text-gray-900 mb-2">Check your email!</p>
              <p className="text-sm text-gray-500 mb-5">
                We've sent a password reset link. Check your inbox.
              </p>
              <button
                onClick={() => { setResetMode(false); setResetSent(false) }}
                className="btn-ghost text-sm py-2"
              >
                ← Back to login
              </button>
            </div>
          )}
        </div>

        {/* ── Sign up link ─────────────────────────────────────────────────── */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-brand-600 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}

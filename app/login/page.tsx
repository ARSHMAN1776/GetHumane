'use client'

/**
 * app/login/page.tsx — GetHumane premium split-screen login
 * Left 45%: auth form · Right 55%: soft-emerald brand panel with floating UI.
 * Auth is wired to Supabase (password + Google/Apple OAuth + reset).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail, Lock, Loader2, Eye, EyeOff,
  Shield, Calendar, Users, Sparkles, Check, Star, Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@/lib/supabase'

/* Exact palette from the design spec */
const PRIMARY = '#0F766E'
const PRIMARY_HOVER = '#115E59'
const SECONDARY = '#14B8A6'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createBrowserClient()

  const [loading,   setLoading]   = useState(false)
  const [oauth,     setOauth]     = useState<'google' | null>(null)
  const [showPass,  setShowPass]  = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // ── Email / password sign-in ───────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email    = fd.get('email') as string
    const password = fd.get('password') as string

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back!')
      router.refresh()
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  // ── OAuth ───────────────────────────────────────────────────────────────────
  const handleOAuth = async (provider: 'google') => {
    setOauth(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) throw error
      // On success the browser is redirected to the provider.
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not continue with ${provider}`)
      setOauth(null)
    }
  }

  // ── Password reset ──────────────────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email') as string
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

  /* Shared input classes — 48px tall, soft teal focus ring */
  const inputBase =
    'w-full h-12 rounded-xl border border-[#E5E7EB] bg-white pl-12 pr-4 text-[15px] text-[#0F172A] ' +
    'placeholder-[#94A3B8] outline-none transition-all duration-200 ' +
    'focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/[0.12]'

  return (
    <div className="min-h-screen w-full lg:h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-[45%_55%] bg-white text-gray-900">

      {/* ═══════════════ LEFT — FORM ═══════════════ */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-0">
        <div className="w-full max-w-[400px] mx-auto animate-fade-in">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-7">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white border border-brand-700/10"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
            >
              <Sparkles size={17} />
            </span>
            <span className="text-[17px] font-bold tracking-tight text-[#0F172A]">GetHumane</span>
          </Link>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-[26px] leading-[1.15] font-bold tracking-tight text-[#0F172A]">
              {resetMode ? 'Reset password' : 'Welcome back'}
            </h1>
            <p className="mt-1.5 text-[14px] text-[#64748B]">
              {resetMode
                ? "Enter your email and we'll send you a reset link."
                : 'Sign in to your account'}
            </p>
          </div>

          {/* ── Sign-in ──────────────────────────────────────────────── */}
          {!resetMode && (
            <>
              {/* Google first — above the form for social-first feel */}
              <button
                onClick={() => handleOAuth('google')}
                disabled={!!oauth}
                className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center gap-3 text-[13.5px] font-semibold text-[#0F172A] transition-all duration-200 hover:bg-[#F8FAFC] hover:border-[#CBD5E1] active:scale-[0.99] disabled:opacity-60 mb-4 cursor-pointer"
              >
                {oauth === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-[11px] font-medium text-[#94A3B8] tracking-wide uppercase">or</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      id="email" name="email" type="email" required autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-[14px] text-[#0F172A] placeholder-[#9CA3AF] outline-none transition-all duration-150 focus:border-[#0F766E] focus:ring-3 focus:ring-[#0F766E]/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-[13px] font-semibold text-[#374151]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-[12px] font-medium transition-colors cursor-pointer"
                      style={{ color: PRIMARY }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      id="password" name="password"
                      type={showPass ? 'text' : 'password'}
                      required autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full h-11 rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-11 text-[14px] text-[#0F172A] placeholder-[#9CA3AF] outline-none transition-all duration-150 focus:border-[#0F766E] focus:ring-3 focus:ring-[#0F766E]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Sign in button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[14px] font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed border border-brand-700/20 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #0D9488 100%)` }}
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                    : 'Sign in'}
                </button>
              </form>
            </>
          )}

          {/* ── Reset form ───────────────────────────────────────────── */}
          {resetMode && !resetSent && (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    id="reset-email" name="email" type="email" required
                    placeholder="you@company.com" className={inputBase}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[15px] font-semibold text-white transition-all duration-[250ms] hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
                style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})` }}
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : <>Send reset link</>}
              </button>
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full text-center text-sm text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {/* ── Reset sent ───────────────────────────────────────────── */}
          {resetMode && resetSent && (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Mail size={24} style={{ color: PRIMARY }} />
              </div>
              <p className="font-semibold text-[#0F172A] mb-1.5">Check your email</p>
              <p className="text-sm text-[#64748B] mb-6">We've sent a secure password reset link to your inbox.</p>
              <button
                onClick={() => { setResetMode(false); setResetSent(false) }}
                className="text-sm font-medium hover:underline cursor-pointer"
                style={{ color: PRIMARY }}
              >
                ← Back to sign in
              </button>
            </div>
          )}

          {/* Bottom links */}
          {!resetMode && (
            <p className="mt-4 text-center text-xs text-[#64748B]">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold hover:underline" style={{ color: PRIMARY }}>
                Sign up
              </Link>
            </p>
          )}
          <p className="mt-4 text-center text-xs text-[#94A3B8]">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline hover:text-[#64748B]">Terms of Service</Link>{' '}and{' '}
            <Link href="/privacy" className="underline hover:text-[#64748B]">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* ═══════════════ RIGHT — BRAND PANEL ═══════════════ */}
      <div
        className="relative hidden lg:flex flex-col items-center justify-center px-12 xl:px-20 overflow-hidden border-l border-gray-200"
        style={{ background: 'linear-gradient(135deg, #F8FFFE 0%, #ECFDF5 100%)' }}
      >
        {/* Soft ambient blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#2DD4BF]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-[#0F766E]/10 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-xl flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur border border-emerald-100">
            <Shield size={15} style={{ color: PRIMARY }} />
            <span className="text-[13px] font-semibold text-[#0F766E]">Trusted by professionals</span>
          </div>

          {/* Headline */}
          <h2 className="mt-5 text-[40px] leading-[1.08] font-semibold tracking-tight text-[#0F172A]">
            Smarter bookings,<br />
            <span style={{ color: PRIMARY }}>better matches.</span>
          </h2>

          {/* Description */}
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#64748B]">
            GetHumane helps you connect with the right providers effortlessly and securely.
          </p>

          {/* Robot centred */}
          <div className="flex justify-center mt-8 mb-12 animate-float-slow">
            <RobotIllustration />
          </div>

          {/* Bottom feature bar */}
          <div className="w-full bg-white rounded-3xl border border-emerald-100 px-8 py-5">
            <div className="grid grid-cols-3 gap-6">
              <Feature Icon={Lock} title="Secure & Private"   sub="Your data is always protected" />
              <Feature Icon={Star} title="Top Rated Providers" sub="Verified and background checked" />
              <Feature Icon={Zap}  title="Quick & Easy"        sub="Book in just a few taps" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function Feature({ Icon, title, sub }: { Icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
        <Icon size={19} style={{ color: PRIMARY }} strokeWidth={1.9} />
      </div>
      <p className="text-[13.5px] font-semibold text-[#0F172A] leading-tight">{title}</p>
      <p className="text-[12px] text-[#64748B] mt-1 leading-snug">{sub}</p>
    </div>
  )
}

/* Friendly 3D-style assistant robot */
function RobotIllustration() {
  return (
    <div className="relative">
      {/* soft ground shadow */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-36 h-6 rounded-full bg-[#0F766E]/15 blur-md" />
      <svg width="180" height="189" viewBox="0 0 200 210" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyG" x1="40" y1="20" x2="170" y2="190" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2DD4BF" />
            <stop offset="0.55" stopColor="#14B8A6" />
            <stop offset="1" stopColor="#0F766E" />
          </linearGradient>
          <linearGradient id="faceG" x1="55" y1="60" x2="145" y2="135" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B3B36" />
            <stop offset="1" stopColor="#0F766E" />
          </linearGradient>
          <radialGradient id="shineG" cx="0.3" cy="0.25" r="0.8">
            <stop stopColor="white" stopOpacity="0.45" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* antenna */}
        <line x1="100" y1="34" x2="100" y2="14" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="11" r="6" fill="#2DD4BF" />

        {/* head */}
        <rect x="34" y="34" width="132" height="104" rx="34" fill="url(#bodyG)" />
        <rect x="34" y="34" width="132" height="104" rx="34" fill="url(#shineG)" />

        {/* ears */}
        <rect x="20" y="70" width="14" height="34" rx="7" fill="#0F766E" />
        <rect x="166" y="70" width="14" height="34" rx="7" fill="#0F766E" />

        {/* face screen */}
        <rect x="52" y="54" width="96" height="66" rx="24" fill="url(#faceG)" />

        {/* eyes */}
        <circle cx="82" cy="86" r="9" fill="white" />
        <circle cx="118" cy="86" r="9" fill="white" />
        <circle cx="84" cy="84" r="3.4" fill="#0B3B36" />
        <circle cx="120" cy="84" r="3.4" fill="#0B3B36" />
        {/* smile */}
        <path d="M84 104 Q100 114 116 104" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* body */}
        <rect x="58" y="146" width="84" height="50" rx="22" fill="url(#bodyG)" />
        <rect x="58" y="146" width="84" height="50" rx="22" fill="url(#shineG)" />
        <circle cx="100" cy="171" r="9" fill="#ECFDF5" />
        <circle cx="100" cy="171" r="4" fill="#0F766E" />
      </svg>
    </div>
  )
}

/* Brand icons */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

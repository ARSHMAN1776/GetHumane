'use client'

/**
 * components/Navbar.tsx
 * Dark glassmorphism navbar — transparent over the dark hero, frosted on scroll.
 * Multi-colour nav links + vibrant themed CTA buttons.
 */

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu, X, Heart, LogOut, LayoutDashboard, Search,
  Settings, ChevronDown, BadgeCheck, Shield, Zap,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import type { UserProfile } from '@/types'

export default function Navbar() {
  const [isOpen,   setIsOpen]   = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [user,     setUser]     = useState<UserProfile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const dropRef  = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  const isDarkPage = pathname === '/'

  // ── Outside click closes dropdown ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Route change resets menus ───────────────────────────────────────────────
  useEffect(() => {
    setDropOpen(false)
    setIsOpen(false)
  }, [pathname])

  // ── Auth state ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: profile } = await supabase
            .from('users').select('*').eq('id', authUser.id).single()
          setUser(profile)
        }
      } catch { /* Supabase not yet configured */ }
      finally { setLoading(false) }
    }
    fetchUser()
    let sub: { unsubscribe: () => void } | null = null
    try {
      const { data } = supabase.auth.onAuthStateChange(() => fetchUser())
      sub = data.subscription
    } catch { /* ignore */ }
    return () => sub?.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll detection ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Sign out ────────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setDropOpen(false)
    router.push('/')
    router.refresh()
  }

  const atTop = false

  // ─── Nav links with per-link accent colours ─────────────────────────────────
  const navLinks = [
    {
      href: '/browse',
      label: 'Browse Skills',
      icon: <Search size={14} />,
      color: 'text-brand-300 hover:text-brand-200',
      pill: 'hover:bg-brand-500/15 border-brand-500/0 hover:border-brand-500/30',
    },
    {
      href: '/safety',
      label: 'Safety',
      icon: <Shield size={14} />,
      color: 'text-emerald-300 hover:text-emerald-200',
      pill: 'hover:bg-emerald-500/15 border-emerald-500/0 hover:border-emerald-500/30',
    },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-gray-950/85 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/40"
    >
      <nav className="container-app">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-black text-xl tracking-tight group"
          >
            {/* Icon with gradient ring on hover */}
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex-shrink-0 shadow-lg shadow-brand-900/50 group-hover:scale-105 transition-transform duration-200">
              <Heart size={16} fill="white" />
              <span className="absolute inset-0 rounded-xl ring-2 ring-brand-400/0 group-hover:ring-brand-400/60 transition-all duration-300" />
            </span>
            <span className="text-white group-hover:text-white/90 transition-colors">
              Get<span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">Humane</span>
            </span>
          </Link>

          {/* ── Desktop nav links ──────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${link.color} ${link.pill}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Desktop auth ───────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="w-32 h-9 bg-white/8 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Dashboard pill */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-violet-300 hover:text-violet-200 border border-violet-500/0 hover:border-violet-500/30 hover:bg-violet-500/15 transition-all duration-200"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>

                {/* Avatar dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen(v => !v)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-white/15 bg-white/8 hover:bg-white/12 hover:border-white/25 transition-all duration-200 text-sm font-semibold text-white backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  >
                    {user.photo_url ? (
                      <img src={user.photo_url} alt={user.full_name}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/40" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-black">
                        {user.full_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-white/90">{user.full_name?.split(' ')[0]}</span>
                    <ChevronDown size={13} className={`text-white/40 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {dropOpen && (
                    <div className="absolute right-0 top-full mt-2.5 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/12 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-fade-in z-50">
                      {/* User header */}
                      <div className="px-4 py-3.5 border-b border-white/10 bg-gradient-to-br from-brand-900/30 to-transparent">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-white truncate">{user.full_name}</p>
                          {user.is_verified && <BadgeCheck size={13} className="text-brand-400 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-white/40 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-700/60 text-brand-200 border border-brand-600/40">
                          {user.role === 'provider' ? 'Skill Provider' : 'Skill Seeker'}
                        </span>
                      </div>

                      <div className="py-1.5">
                        <Link href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-violet-500/10 transition-colors">
                          <LayoutDashboard size={14} className="text-violet-400" />
                          Dashboard
                        </Link>
                        <Link href="/dashboard/settings"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/8 transition-colors">
                          <Settings size={14} className="text-white/40" />
                          Profile Settings
                        </Link>
                      </div>

                      <div className="border-t border-white/10 py-1.5">
                        <button onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Log in — ghost with subtle border */}
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white/65 hover:text-white border border-white/10 hover:border-white/25 hover:bg-white/8 transition-all duration-200"
                >
                  Log in
                </Link>

                {/* Get Started — vivid orange-to-brand gradient pill */}
                <Link
                  href="/signup"
                  className="relative px-5 py-2 rounded-xl text-sm font-bold text-white overflow-hidden group transition-all duration-200 hover:scale-[1.03] active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 40%, #f97316 100%)',
                    boxShadow: '0 0 20px rgba(14,165,233,0.35), 0 4px 14px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Shine sweep */}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out" />
                  <span className="relative flex items-center gap-1.5">
                    <Zap size={14} className="fill-white" />
                    Get Started
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ───────────────────────────────────────────── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile menu ─────────────────────────────────────────────────── */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1 animate-fade-in bg-gray-950/98 backdrop-blur-xl">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${link.color} hover:bg-white/8`}>
                {link.icon}
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/10 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 mb-1">
                    {user.photo_url ? (
                      <img src={user.photo_url} alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/40" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold">
                        {user.full_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-white/40 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-violet-300 hover:text-violet-200 hover:bg-violet-500/10 transition-colors">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <Settings size={16} className="text-white/40" />
                    Profile Settings
                  </Link>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-1">
                  <Link href="/login" onClick={() => setIsOpen(false)}
                    className="text-center py-2.5 rounded-xl text-sm font-semibold text-white/70 border border-white/15 hover:bg-white/10 transition-all">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}
                    className="text-center py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 40%, #f97316 100%)' }}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

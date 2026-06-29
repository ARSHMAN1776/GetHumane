'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu, X, Heart, LogOut, LayoutDashboard,
  Settings, ChevronDown, BadgeCheck, TrendingUp,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import type { UserProfile } from '@/types'

const GRAD = 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)'

const NAV_LINKS = [
  { href: '/browse',       label: 'Browse Skills'    },
  { href: '/safety',       label: 'Safety'            },
  { href: '/how-it-works', label: 'How It Works'      },
  { href: '/groups',       label: 'For Organizations' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropOpen,   setDropOpen]   = useState(false)
  const [user,       setUser]       = useState<UserProfile | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [scrolled,   setScrolled]   = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const dropRef  = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Reset menus on route change
  useEffect(() => { setDropOpen(false); setMobileOpen(false) }, [pathname])

  // Auth
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single()
          setUser(profile)
        }
      } catch { /* ignore */ }
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

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setDropOpen(false)
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-colors duration-200 ${
        scrolled ? 'border-b border-gray-200' : 'border-b border-gray-100'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform"
              style={{ background: GRAD }}
            >
              <Heart size={15} fill="white" className="text-white" />
            </span>
            <span className="font-bold text-[17px] tracking-tight text-[#0F172A]">GetHumane</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                  isActive(href)
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="w-28 h-9 bg-gray-100 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-semibold text-[#0F766E] hover:bg-emerald-50 transition-colors"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>

                {/* Avatar dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen(v => !v)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-[13.5px] font-semibold text-[#0F172A]"
                  >
                    {user.photo_url ? (
                      <img src={user.photo_url} alt={user.full_name} className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-100" />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: GRAD }}
                      >
                        {user.full_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-[#0F172A]">{user.full_name?.split(' ')[0]}</span>
                    <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden animate-fade-in z-50">
                      {/* User header */}
                      <div className="px-4 py-3.5 border-b border-gray-100 bg-gray-50/60">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-[13px] font-bold text-[#0F172A] truncate">{user.full_name}</p>
                          {user.is_verified && <BadgeCheck size={13} className="text-emerald-500 flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-[#94A3B8] truncate">{user.email}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {user.role === 'provider' ? 'Skill Provider' : 'Skill Seeker'}
                        </span>
                      </div>

                      <div className="py-1.5">
                        <Link href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#374151] hover:text-[#0F172A] hover:bg-emerald-50/60 transition-colors">
                          <LayoutDashboard size={14} className="text-emerald-600" />
                          Dashboard
                        </Link>
                        <Link href="/dashboard/settings"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#374151] hover:text-[#0F172A] hover:bg-gray-50 transition-colors">
                          <Settings size={14} className="text-gray-400" />
                          Profile Settings
                        </Link>
                        {user.role === 'provider' && (
                          <Link href="/dashboard/analytics"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#374151] hover:text-[#0F172A] hover:bg-gray-50 transition-colors">
                            <TrendingUp size={14} className="text-gray-400" />
                            Analytics
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 py-1.5">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:text-red-600 hover:bg-red-50/60 transition-colors"
                        >
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
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-[13.5px] font-semibold text-[#374151] hover:text-[#0F172A] hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-xl text-[13.5px] font-bold text-white transition-all hover:opacity-90 hover:-translate-y-px shadow-[0_4px_14px_-4px_rgba(15,118,110,0.4)]"
                  style={{ background: GRAD }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 animate-fade-in">
            <div className="space-y-1 mb-4">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[13.5px] font-medium transition-colors ${
                    isActive(href)
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-[#374151] hover:text-[#0F172A] hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 mb-1">
                    {user.photo_url ? (
                      <img src={user.photo_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: GRAD }}
                      >
                        {user.full_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0F172A] truncate">{user.full_name}</p>
                      <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13.5px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13.5px] font-medium text-[#374151] hover:bg-gray-50 transition-colors">
                    <Settings size={16} className="text-gray-400" /> Settings
                  </Link>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-[13.5px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="text-center py-3 rounded-xl text-[13.5px] font-semibold text-[#374151] border border-gray-200 hover:bg-gray-50 transition-all">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}
                    className="text-center py-3 rounded-xl text-[13.5px] font-bold text-white transition-all hover:opacity-90"
                    style={{ background: GRAD }}
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

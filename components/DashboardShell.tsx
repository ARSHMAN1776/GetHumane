'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import DashboardSidebar from '@/components/DashboardSidebar'
import type { UserProfile } from '@/types'

const STORAGE_KEY = 'gh:dash:sidebar-collapsed'

/**
 * Client shell for the dashboard. Owns the sidebar UI state (desktop collapse +
 * mobile drawer) and keeps the main content's left offset in sync with the
 * sidebar width. The server layout passes the already-fetched `user` as a prop.
 */
export default function DashboardShell({
  user,
  children,
}: {
  user: UserProfile
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Restore the user's collapse preference after hydration.
  useEffect(() => {
    if (typeof window === 'undefined') return
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === '1')
  }, [])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const toggleCollapsed = () =>
    setCollapsed(prev => {
      const next = !prev
      try { window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch { /* ignore */ }
      return next
    })

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Content column — left padding tracks the desktop sidebar width */}
      <div
        className={`min-w-0 transition-[padding] duration-300 ease-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="-ml-1.5 w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <Menu size={21} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <path d="M16 1L31 16L16 31L1 16Z" fill="#10b981" />
              <path d="M16 8v16M8 16h16" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
            <span className="font-bold text-gray-900 text-[15px] tracking-tight">GetHumane</span>
          </Link>
        </header>

        {children}
      </div>
    </div>
  )
}

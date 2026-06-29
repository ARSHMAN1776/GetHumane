'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Users, MessageSquare,
  Heart, Settings, BadgeCheck, LogOut, X,
  PanelLeftClose, PanelLeftOpen, Compass
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { UserProfile } from '@/types'

interface Props {
  user: UserProfile
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Dashboard',      Icon: LayoutDashboard },
  { href: '/dashboard/bookings', label: 'Bookings',       Icon: Calendar },
  { href: '/browse',             label: 'Explore Skills', Icon: Compass },
  { href: '/dashboard/messages', label: 'Messages',       Icon: MessageSquare, showBadge: true },
  { href: '/groups',             label: 'Group Sessions', Icon: Users },
  { href: '/dashboard/settings', label: 'Settings',       Icon: Settings },
]

export default function DashboardSidebar({
  user, collapsed, onToggleCollapsed, mobileOpen, onMobileClose,
}: Props) {
  const pathname     = usePathname()
  const router       = useRouter()
  const supabase     = createBrowserClient()
  const [signingOut, setSigningOut] = useState(false)
  const [unread,     setUnread]     = useState(0)



  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('read', false)
        setUnread(count ?? 0)
      } catch (err) {
        console.error('Error fetching unread messages count:', err)
      }
    }
    fetchUnreadCount()
  }, [user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  /**
   * Shared sidebar body. `mini` collapses it to an icon-only rail (desktop only);
   * the mobile drawer always renders the full-width version.
   */
  function SidebarBody({ mini }: { mini: boolean }) {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center h-16 flex-shrink-0 border-b border-gray-100 ${mini ? 'justify-center px-0' : 'px-5 gap-3'}`}>
          <Link href="/dashboard" onClick={onMobileClose} className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)' }}
            >
              <Heart size={14} fill="white" className="text-white" />
            </span>
            {!mini && <span className="font-bold text-gray-900 text-[16px] tracking-tight truncate">GetHumane</span>}
          </Link>
        </div>

        {/* Nav */}
        <nav className={`flex-1 pt-4 pb-2 space-y-1 overflow-y-auto overflow-x-hidden ${mini ? 'px-2.5' : 'px-3'}`}>
          {NAV_ITEMS.map(({ href, label, Icon, showBadge }) => {
            const active = isActive(href)
            const badge  = showBadge ? unread : 0
            return (
              <Link
                key={href}
                href={href}
                onClick={onMobileClose}
                title={mini ? label : undefined}
                className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
                  mini ? 'justify-center h-11' : 'gap-3.5 px-4 py-[11px]'
                } ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                {/* Active indicator bar */}
                {active && !mini && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full" />
                )}
                <span className="relative flex-shrink-0">
                  <Icon size={19} className={active ? 'text-emerald-600' : 'text-gray-400'} strokeWidth={active ? 2.1 : 1.75} />
                  {/* Dot badge when collapsed */}
                  {badge > 0 && mini && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  )}
                </span>
                {!mini && <span className="flex-1 truncate">{label}</span>}
                {badge > 0 && !mini && (
                  <span className="w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>



        {/* User section */}
        <div className={`pb-4 pt-2 border-t border-gray-100 flex-shrink-0 ${mini ? 'px-2.5' : 'px-3'}`}>
          {mini ? (
            <div className="flex flex-col items-center gap-2">
              <Link href="/dashboard/settings" title={user.full_name} className="block">
                <Avatar user={user} />
              </Link>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign out"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-1.5 py-1.5">
              <Link
                href="/dashboard/settings"
                onClick={onMobileClose}
                className="flex items-center gap-3 flex-1 min-w-0 rounded-xl px-1.5 py-1.5 -mx-1.5 hover:bg-gray-50 transition-colors"
              >
                <Avatar user={user} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold text-gray-800 truncate leading-tight">{user.full_name}</p>
                    {user.is_verified && <BadgeCheck size={13} className="text-emerald-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-400 capitalize truncate">{user.role}</p>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign out"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 disabled:opacity-50"
              >
                <LogOut size={17} />
              </button>
            </div>
          )}
        </div>

        {/* Collapse toggle at the bottom (desktop only) */}
        <div className="hidden lg:flex p-3 border-t border-gray-100 flex-shrink-0 justify-center">
          <button
            onClick={onToggleCollapsed}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer"
            title={mini ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {mini ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-gray-100 transition-[width] duration-300 ease-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarBody mini={collapsed} />
      </aside>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          onClick={onMobileClose}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Panel */}
        <aside
          className={`absolute top-0 left-0 bottom-0 w-72 max-w-[82%] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={onMobileClose}
            aria-label="Close menu"
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <X size={18} />
          </button>
          <SidebarBody mini={false} />
        </aside>
      </div>
    </>
  )
}

function Avatar({ user }: { user: UserProfile }) {
  return (
    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm ring-2 ring-gray-100">
      {user.photo_url
        ? <img src={user.photo_url} alt={user.full_name ?? ''} className="w-full h-full object-cover" />
        : user.full_name?.[0]?.toUpperCase()}
    </div>
  )
}

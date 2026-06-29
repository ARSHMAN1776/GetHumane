import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Flag, AlertTriangle, Mail, BarChart2,
  CheckCircle, Clock, XCircle, BadgeCheck, Zap,
} from 'lucide-react'
import { createServerClient, getCurrentUser } from '@/lib/supabase'
import DisputePanel from '@/components/DisputePanel'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — GetHumane' }
export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase())

export default async function AdminPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email?.toLowerCase() ?? '')) {
    redirect('/')
  }

  const supabase = await createServerClient()

  const [
    { count: totalUsers },
    { count: totalProviders },
    { count: totalSeekers },
    { count: totalBookings },
    { count: pendingBookings },
    { count: completedBookings },
    { count: openReports },
    { count: openDisputes },
    { count: waitlistCount },
    { data: recentUsers },
    { data: recentReports },
    { data: recentDisputes },
    { data: waitlist },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'provider'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seeker'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('waitlist').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('id,full_name,email,role,is_verified,created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('reports').select('id,reason,created_at,reporter:users!reports_reporter_id_fkey(full_name),reported:users!reports_reported_user_id_fkey(full_name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('disputes').select('id,reason,status,evidence_text,created_at,opener:users!disputes_opened_by_fkey(full_name)').eq('status', 'open').order('created_at', { ascending: false }).limit(10),
    supabase.from('waitlist').select('id,email,created_at').order('created_at', { ascending: false }).limit(20),
  ])

  const stats = [
    { label: 'Total Users',       value: totalUsers ?? 0,       icon: <Users size={20} />,         color: 'bg-brand-600' },
    { label: 'Providers',         value: totalProviders ?? 0,   icon: <BadgeCheck size={20} />,    color: 'bg-emerald-600' },
    { label: 'Seekers',           value: totalSeekers ?? 0,     icon: <Users size={20} />,         color: 'bg-violet-600' },
    { label: 'Total Bookings',    value: totalBookings ?? 0,    icon: <BarChart2 size={20} />,     color: 'bg-blue-600' },
    { label: 'Pending Bookings',  value: pendingBookings ?? 0,  icon: <Clock size={20} />,         color: 'bg-amber-500' },
    { label: 'Completed',         value: completedBookings ?? 0,icon: <CheckCircle size={20} />,  color: 'bg-teal-600' },
    { label: 'Open Reports',      value: openReports ?? 0,      icon: <Flag size={20} />,          color: 'bg-red-600' },
    { label: 'Open Disputes',     value: openDisputes ?? 0,     icon: <AlertTriangle size={20} />, color: 'bg-orange-600' },
    { label: 'Waitlist',          value: waitlistCount ?? 0,    icon: <Mail size={20} />,          color: 'bg-pink-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">GetHumane Admin</h1>
            <p className="text-white/40 text-xs">Logged in as {currentUser.email}</p>
          </div>
        </div>
        <Link href="/dashboard" className="text-xs text-white/40 hover:text-white transition-colors">
          ← Back to site
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white flex-shrink-0`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
              <p className="text-xs text-white/40 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Open Disputes ────────────────────────────────────────────────── */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-400" />
                <h2 className="font-bold text-white text-sm">Open Disputes</h2>
              </div>
              <span className="text-xs text-orange-400 font-bold">{openDisputes ?? 0} open</span>
            </div>
            <DisputePanel disputes={(recentDisputes ?? []) as any} openCount={openDisputes ?? 0} />
          </div>

          {/* ── Recent Reports ───────────────────────────────────────────────── */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag size={16} className="text-red-400" />
                <h2 className="font-bold text-white text-sm">Recent Reports</h2>
              </div>
              <span className="text-xs text-red-400 font-bold">{openReports ?? 0} total</span>
            </div>
            {!recentReports?.length ? (
              <p className="text-white/30 text-sm px-5 py-8 text-center">No reports. ✓</p>
            ) : (
              <div className="divide-y divide-white/5">
                {recentReports.map((r: any) => (
                  <div key={r.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white text-xs">
                        <span className="font-semibold">{r.reporter?.full_name ?? '?'}</span>
                        <span className="text-white/40"> reported </span>
                        <span className="font-semibold">{r.reported?.full_name ?? '?'}</span>
                      </p>
                    </div>
                    <p className="text-white/50 text-xs line-clamp-1">{r.reason}</p>
                    <p className="text-white/20 text-xs mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Recent Users ─────────────────────────────────────────────────── */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
              <Users size={16} className="text-brand-400" />
              <h2 className="font-bold text-white text-sm">Recent Signups</h2>
            </div>
            <div className="divide-y divide-white/5">
              {(recentUsers ?? []).map((u: any) => (
                <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {u.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{u.full_name}</p>
                    <p className="text-white/30 text-xs truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === 'provider' ? 'bg-brand-500/20 text-brand-400' : 'bg-violet-500/20 text-violet-400'
                    }`}>{u.role}</span>
                    {u.is_verified && <BadgeCheck size={12} className="text-emerald-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Waitlist ─────────────────────────────────────────────────────── */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-pink-400" />
                <h2 className="font-bold text-white text-sm">Waitlist</h2>
              </div>
              <span className="text-xs text-pink-400 font-bold">{waitlistCount ?? 0} emails</span>
            </div>
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {(waitlist ?? []).map((w: any) => (
                <div key={w.id} className="px-5 py-3 flex items-center justify-between">
                  <p className="text-white/70 text-xs truncate">{w.email}</p>
                  <p className="text-white/20 text-xs flex-shrink-0 ml-3">{new Date(w.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

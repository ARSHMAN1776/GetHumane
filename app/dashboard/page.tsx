import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, DollarSign, Star, Clock, Search,
  CheckCircle, Loader, XCircle, Bell,
  TrendingUp, Users, Shield, Zap, ArrowRight, Sparkles,
} from 'lucide-react'
import { createServerClient, getCurrentUser } from '@/lib/supabase'
import BookingActions from '@/components/BookingActions'
import SeeMoreBookings from '@/components/SeeMoreBookings'
import NotificationBell from '@/components/NotificationBell'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — GetHumane' }
export const dynamic = 'force-dynamic'

/* ── Shared stat card ───────────────────────────────────────────────────────── */
function StatCard({
  Icon, iconCls, value, label, sub, href,
}: {
  Icon: React.ElementType
  iconCls: string
  value: string | number
  label: string
  sub: string
  href: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
        <Icon size={24} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-4xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-2 font-medium">{label}</p>
        <Link href={href} className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 mt-1.5 transition-colors">
          {sub} <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  )
}

/* ── Robot decoration ───────────────────────────────────────────────────────── */
function RobotIllustration() {
  return (
    <div className="relative w-36 h-28 flex-shrink-0 flex items-center justify-center select-none overflow-hidden" aria-hidden>
      {/* glow blob */}
      <div className="absolute bottom-0 right-0 w-28 h-28 bg-emerald-100 rounded-full" />
      {/* plus decorations */}
      <span className="absolute top-1 right-2 text-emerald-400 font-black text-lg leading-none">+</span>
      <span className="absolute bottom-2 left-1 text-emerald-400 font-black text-lg leading-none">+</span>
      {/* robot */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-base leading-none mb-1">❤️</span>
        {/* head */}
        <div className="w-14 h-14 bg-emerald-800 rounded-2xl border border-emerald-700/50 flex flex-col items-center justify-center gap-1.5">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          </div>
          <div className="w-6 h-0.5 bg-white/60 rounded-full" />
        </div>
        {/* body */}
        <div className="w-10 h-5 bg-emerald-700/60 rounded-b-xl" />
      </div>
    </div>
  )
}

/* ── Trust badges ───────────────────────────────────────────────────────────── */
function TrustBadges() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-8 py-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { Icon: Shield, label: 'Secure & Private', sub: 'Your data is protected', cls: 'bg-emerald-50 text-emerald-600' },
          { Icon: Star, label: 'Top Rated Providers', sub: 'Verified and reviewed', cls: 'bg-amber-50 text-amber-500' },
          { Icon: Zap, label: 'Quick & Easy', sub: 'Book in just a few taps', cls: 'bg-blue-50 text-blue-500' },
        ].map(({ Icon, label, sub, cls }) => (
          <div key={label} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cls}`}>
              <Icon size={18} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const supabase = await createServerClient()
  const firstName = user.full_name?.split(' ')[0] ?? 'there'

  /* ═══ PROVIDER ═══════════════════════════════════════════════════════════════ */
  if (user.role === 'provider') {
    const [{ data: bookings }, { data: reviews }, { data: skills }, { data: groupSessions }] = await Promise.all([
      supabase
        .from('bookings')
        .select('*, seeker:users!bookings_seeker_id_fkey(id,full_name,photo_url,city)')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('reviews').select('rating').eq('reviewee_id', user.id),
      supabase.from('skills').select('skill_name,hourly_rate').eq('user_id', user.id).limit(4),
      supabase
        .from('group_sessions')
        .select('*, enrollments:group_enrollments(count)')
        .eq('provider_id', user.id)
        .order('date_time', { ascending: true })
    ])

    const avgRating = reviews?.length ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
    const totalEarned = bookings?.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total_price ?? 0), 0) ?? 0
    const pendingCount = bookings?.filter(b => b.status === 'pending').length ?? 0
    const confirmed = bookings?.filter(b => b.status === 'confirmed').length ?? 0

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Header */}
        <div className="px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-brand-900 to-brand-700 border-b border-brand-950">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {firstName} 👋</h1>
            <p className="text-emerald-300/70 text-sm mt-1">
              {pendingCount > 0
                ? `You have ${pendingCount} booking request${pendingCount > 1 ? 's' : ''} waiting.`
                : "Here's what's happening with your bookings today."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <NotificationBell userId={user.id} role="provider" />
            <Link href="/dashboard/analytics" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-all">
              <TrendingUp size={15} /> Analytics
            </Link>
            <Link href="/browse" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold transition-all">
              <Search size={15} /> Browse Seekers
            </Link>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard Icon={Calendar} iconCls="bg-teal-100 text-teal-700" value={bookings?.length ?? 0} label="Total Bookings" sub={`${confirmed} upcoming`} href="#bookings" />
            <StatCard Icon={Clock} iconCls={pendingCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'} value={pendingCount} label="Pending" sub={pendingCount > 0 ? 'Needs action' : 'All clear'} href="#bookings" />
            <StatCard Icon={DollarSign} iconCls="bg-emerald-100 text-emerald-700" value={`$${totalEarned.toFixed(0)}`} label="Total Earned" sub={`${bookings?.filter(b => b.status === 'completed').length ?? 0} sessions done`} href="/dashboard/analytics" />
            <StatCard Icon={Star} iconCls="bg-yellow-100 text-yellow-600" value={avgRating ?? '—'} label="Avg Rating" sub={reviews?.length ? `${reviews.length} reviews` : 'No reviews yet'} href="#" />
          </div>

          {/* AI recs banner */}
          <div className="bg-white rounded-2xl border border-gray-100 px-7 py-6 flex items-center gap-4 overflow-hidden">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={22} className="text-emerald-600" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-base">AI-Powered Recommendations</p>
              <p className="text-sm text-gray-400 mt-1">Tell us what you need in your profile to get personalized seeker matches.</p>
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <Link href="/dashboard/settings" className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition-all whitespace-nowrap">
                  Update Profile
                </Link>
                <Link href="/how-it-works" className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap">
                  Learn more <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <RobotIllustration />
          </div>

          {/* Bookings */}
          <div id="bookings" className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Booking Requests</h2>
              <Link href="/dashboard/bookings" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                View all bookings <ArrowRight size={13} />
              </Link>
            </div>
            {!bookings?.length ? (
              <div className="py-16 text-center px-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-emerald-300" />
                </div>
                <p className="font-semibold text-gray-500">No booking requests yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-5 max-w-xs mx-auto">
                  Complete your profile and list your skills to start attracting clients.
                </p>
                {!skills?.length && (
                  <Link href="/dashboard/settings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">
                    <Sparkles size={15} /> Add your skills
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-50">
                  {bookings.slice(0, 5).map(booking => (
                    <BookingActions key={booking.id} booking={booking} />
                  ))}
                </div>
                {bookings.length > 5 && (
                  <div className="border-t border-gray-100 py-3 text-center">
                    <Link href="/dashboard/bookings" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
                      View all {bookings.length} bookings →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Group Sessions section */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">My Group Sessions</h2>
              <Link href="/groups" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                Browse group sessions <ArrowRight size={13} />
              </Link>
            </div>
            {!groupSessions?.length ? (
              <div className="py-12 text-center px-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users size={20} className="text-emerald-400" />
                </div>
                <p className="font-semibold text-gray-500 text-sm">No group sessions scheduled</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Host group classes to teach multiple students simultaneously and increase your earnings.
                </p>
                <Link href="/groups/create" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">
                  Create Group Session
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {groupSessions.map((session: any) => {
                  const enrolled = session.enrollments?.[0]?.count ?? 0
                  return (
                    <div key={session.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{session.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {session.skill_name} · {new Date(session.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-md">{session.location}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-800">{enrolled} / {session.max_capacity} Enrolled</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">${session.price_per_seat} per seat</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-700 rounded-full capitalize">
                          {session.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <TrustBadges />
        </div>
      </div>
    )
  }

  /* ═══ SEEKER ════════════════════════════════════════════════════════════════ */
  const [{ data: bookings }, { data: myReviews }, { data: nearby }, { data: groupEnrollments }] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, provider:users!bookings_provider_id_fkey(id,full_name,photo_url)')
      .eq('seeker_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('reviews').select('booking_id').eq('reviewer_id', user.id),
    supabase.from('users').select('id').eq('role', 'provider').eq('city', user.city ?? '').neq('id', user.id),
    supabase
      .from('group_enrollments')
      .select('*, session:group_sessions(*, provider:users(id, full_name, photo_url))')
      .eq('seeker_id', user.id)
      .order('created_at', { ascending: false })
  ])

  const reviewedIds = (myReviews ?? []).map(r => r.booking_id)
  const activeCount = bookings?.filter(b => ['pending', 'confirmed'].includes(b.status)).length ?? 0
  const nearbyCount = nearby?.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-brand-900 to-brand-700 border-b border-brand-950">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {firstName} 👋</h1>
          <p className="text-emerald-300/70 text-sm mt-1">Here's what's happening with your bookings today.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <NotificationBell userId={user.id} role="seeker" />
          <Link href="/onboarding/quiz" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-all">
            <Sparkles size={15} /> AI Match
          </Link>
          <Link href="/browse" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold transition-all">
            <Search size={15} /> Browse Providers
          </Link>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard Icon={Calendar} iconCls="bg-teal-100 text-teal-700" value={bookings?.length ?? 0} label="My Bookings" sub="View all upcoming bookings" href="#bookings" />
          <StatCard Icon={Clock} iconCls="bg-amber-100 text-amber-600" value={activeCount} label="Active Sessions" sub="In progress right now" href="#bookings" />
          <StatCard Icon={Users} iconCls="bg-blue-100 text-blue-600" value={nearbyCount} label="Nearby Providers" sub="Available in your area" href="/browse" />
        </div>

        {/* AI recs */}
        <div className="bg-white rounded-2xl border border-gray-100 px-7 py-6 flex items-center gap-6">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={22} className="text-emerald-600" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base">AI-Powered Recommendations</p>
            <p className="text-sm text-gray-400 mt-1">Tell us what you need in your profile to get personalized provider matches.</p>
            <div className="flex items-center gap-4 mt-4">
              <Link href="/dashboard/settings" className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition-all">
                Update Profile
              </Link>
              <Link href="/how-it-works" className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Learn more <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <RobotIllustration />
        </div>

        {/* My Bookings */}
        <div id="bookings" className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">My Bookings</h2>
            <Link href="/dashboard/bookings" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
              View all bookings <ArrowRight size={13} />
            </Link>
          </div>

          {!bookings?.length ? (
            <div className="py-16 text-center px-6">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-teal-300" />
              </div>
              <p className="font-semibold text-gray-500">No bookings yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-5">Browse local skill providers and make your first booking.</p>
              <Link href="/browse" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">
                <Search size={15} /> Find a Provider
              </Link>
            </div>
          ) : (
            <SeeMoreBookings
              bookings={bookings as any}
              reviewedIds={reviewedIds}
              initialShow={2}
            />
          )}
        </div>

        {/* Enrolled Group Sessions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">My Enrolled Groups</h2>
            <Link href="/groups" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
              Find group sessions <ArrowRight size={13} />
            </Link>
          </div>
          {!groupEnrollments?.length ? (
            <div className="py-12 text-center px-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-emerald-400" />
              </div>
              <p className="font-semibold text-gray-500 text-sm">No group sessions joined yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Join group learning circles with friends and neighbors.</p>
              <Link href="/groups" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">
                Browse Group Sessions
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {groupEnrollments.map((enrollment: any) => {
                const s = enrollment.session
                if (!s) return null
                return (
                  <div key={enrollment.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold overflow-hidden flex-shrink-0">
                        {s.provider?.photo_url ? (
                          <img src={s.provider.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          s.provider?.full_name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{s.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Led by {s.provider?.full_name || 'Verified Provider'} · {s.skill_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(s.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{enrollment.seats} Seat{enrollment.seats > 1 ? 's' : ''}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Total Paid: ${enrollment.total_paid}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full capitalize">
                        {enrollment.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <TrustBadges />
      </div>
    </div>
  )
}

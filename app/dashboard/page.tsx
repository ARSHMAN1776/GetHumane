/**
 * app/dashboard/page.tsx — Dashboard (Server Component, protected)
 *
 * Provider: booking requests with confirm/decline/details, stat cards, earnings graph label.
 * Seeker:   my bookings, nearby providers grid.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, DollarSign, Star, Users, Clock,
  CheckCircle, XCircle, Loader, Search, ArrowRight,
  BadgeCheck, MapPin, TrendingUp, Sparkles, Heart,
  BookOpen, ChevronRight,
} from 'lucide-react'
import { createServerClient, getCurrentUser } from '@/lib/supabase'
import EmptyState from '@/components/EmptyState'
import BookingActions from '@/components/BookingActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — GetHumane' }
export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  pending:   'badge-orange',
  confirmed: 'badge-blue',
  completed: 'badge-green',
  cancelled: 'badge-gray',
}
const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:   <Loader   size={12} />,
  confirmed: <CheckCircle size={12} />,
  completed: <CheckCircle size={12} />,
  cancelled: <XCircle  size={12} />,
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createServerClient()

  // ── Provider Dashboard ──────────────────────────────────────────────────────
  if (user.role === 'provider') {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, seeker:users!bookings_seeker_id_fkey(id,full_name,photo_url,city)')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false })

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', user.id)

    const { data: skills } = await supabase
      .from('skills')
      .select('skill_name,hourly_rate')
      .eq('user_id', user.id)
      .limit(3)

    const avgRating     = reviews?.length
      ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null
    const totalEarnings = bookings
      ?.filter((b) => b.status === 'completed')
      .reduce((s, b) => s + (b.total_price ?? 0), 0) ?? 0
    const pendingCount  = bookings?.filter((b) => b.status === 'pending').length ?? 0
    const confirmedCount= bookings?.filter((b) => b.status === 'confirmed').length ?? 0

    return (
      <div className="min-h-screen bg-gray-50">
        {/* ── Welcome banner ─────────────────────────────────────────────── */}
        <div className="bg-gray-950 pt-24 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-800 rounded-full blur-3xl opacity-20" />
          <div className="container-app relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {user.photo_url ? (
                    <img src={user.photo_url} alt={user.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-black border-2 border-brand-400">
                      {user.full_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white/50 text-sm font-medium">Skill Provider</p>
                    <div className="flex items-center gap-1.5">
                      {user.is_verified && <BadgeCheck size={14} className="text-brand-400" />}
                      <p className="text-white font-bold">{user.full_name}</p>
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Good to see you back, {user.full_name?.split(' ')[0]} 👋
                </h1>
                <p className="text-white/50 mt-1">
                  {pendingCount > 0
                    ? `You have ${pendingCount} pending booking request${pendingCount > 1 ? 's' : ''} waiting for your response.`
                    : 'Your provider dashboard — manage your bookings and skills.'}
                </p>
              </div>
              {skills && skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s.skill_name} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white/70 text-xs font-semibold">
                      {s.skill_name} · ${s.hourly_rate}/hr
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container-app py-8 -mt-1">
          {/* ── Stats row ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Bookings',
                value: bookings?.length ?? 0,
                icon: <Calendar size={20} />,
                bg: 'bg-brand-600',
                sub: `${confirmedCount} confirmed`,
              },
              {
                label: 'Pending Requests',
                value: pendingCount,
                icon: <Clock size={20} />,
                bg: 'bg-amber-500',
                sub: pendingCount ? 'Action needed' : 'All caught up ✓',
              },
              {
                label: 'Total Earned',
                value: `$${totalEarnings.toFixed(0)}`,
                icon: <DollarSign size={20} />,
                bg: 'bg-emerald-600',
                sub: 'from completed sessions',
              },
              {
                label: 'Your Rating',
                value: avgRating ? `${avgRating} ★` : '—',
                icon: <Star size={20} />,
                bg: 'bg-yellow-500',
                sub: reviews?.length ? `${reviews.length} reviews` : 'No reviews yet',
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center text-white`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400 font-medium">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Pending alert banner ──────────────────────────────────────── */}
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900 text-sm">
                    {pendingCount} booking request{pendingCount > 1 ? 's' : ''} waiting for your response
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">Respond within 24 hours to keep a high response rate.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-amber-500 flex-shrink-0" />
            </div>
          )}

          {/* ── Booking Requests ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Booking Requests</h2>
                <p className="text-xs text-gray-400 mt-0.5">Click ▼ on any row to see details and take action on pending bookings.</p>
              </div>
              <span className="badge-blue ml-4 flex-shrink-0">{bookings?.length ?? 0} total</span>
            </div>

            {!bookings?.length ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} className="text-brand-300" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">No booking requests yet</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                  Complete your profile and add your skills to start getting booked by seekers in your city.
                </p>
                <Link href="/dashboard/settings" className="btn-secondary text-sm py-2">
                  <Sparkles size={15} />
                  Complete Your Profile
                </Link>
              </div>
            ) : (
              <div>
                {bookings.map((booking) => (
                  <BookingActions key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Seeker Dashboard ────────────────────────────────────────────────────────
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, provider:users!bookings_provider_id_fkey(id,full_name,photo_url,city)')
    .eq('seeker_id', user.id)
    .order('created_at', { ascending: false })

  const { data: nearbyProviders } = await supabase
    .from('users')
    .select('*, skills(*)')
    .eq('role', 'provider')
    .eq('city', user.city)
    .neq('id', user.id)
    .limit(6)

  const activeCount = bookings?.filter((b) => ['pending','confirmed'].includes(b.status)).length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Welcome banner ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.2) 50%, rgba(255,255,255,.2) 75%, transparent 75%)', backgroundSize: '40px 40px' }}
        />
        <div className="container-app relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {user.photo_url ? (
                  <img src={user.photo_url} alt={user.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-black">
                    {user.full_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-brand-200 text-sm font-medium">Skill Seeker</p>
                  <p className="text-white font-bold">{user.full_name}</p>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Hey {user.full_name?.split(' ')[0]}, find your next human connection 👋
              </h1>
              <p className="text-brand-200 mt-1">
                {user.city ? `Showing providers in ${user.city} and nearby.` : 'Browse real people offering real skills near you.'}
              </p>
            </div>
            <Link href="/browse" className="btn-white flex-shrink-0">
              <Search size={18} className="text-brand-600" />
              <span className="text-brand-700 font-bold">Browse Skills</span>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            {[
              { label: 'My Bookings',     value: bookings?.length ?? 0 },
              { label: 'Active Sessions', value: activeCount },
              { label: 'Nearby Providers',value: nearbyProviders?.length ?? 0 },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 border border-white/20 text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-brand-200 text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* ── Active Bookings ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">My Bookings</h2>
              <p className="text-xs text-gray-400 mt-0.5">All your booking history with providers.</p>
            </div>
            <span className="badge-blue ml-4 flex-shrink-0">{bookings?.length ?? 0} total</span>
          </div>

          {!bookings?.length ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Heart size={28} className="text-brand-300" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">No bookings yet</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                Browse real people near you and make your first booking — it only takes 2 minutes.
              </p>
              <Link href="/browse" className="btn-primary text-sm py-2.5">
                <Search size={15} />
                Find a Skill Provider
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-brand-700 overflow-hidden">
                    {booking.provider?.photo_url ? (
                      <img src={booking.provider.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      booking.provider?.full_name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {booking.provider?.full_name ?? 'Unknown provider'}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <Clock size={11} />
                      {new Date(booking.date_time).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                      <MapPin size={11} />
                      <span className="truncate max-w-[100px]">{booking.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-gray-800">
                      ${booking.total_price?.toFixed(2)}
                    </span>
                    <span className={`${STATUS_STYLES[booking.status] ?? 'badge-gray'} capitalize`}>
                      {STATUS_ICONS[booking.status]}
                      {booking.status}
                    </span>
                    <Link
                      href={`/provider/${booking.provider_id}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline flex-shrink-0 flex items-center gap-0.5"
                    >
                      View <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Nearby Providers ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900 text-xl">
                {user.city ? `Providers near ${user.city}` : 'Providers Near You'}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Real people, real skills, ready to meet.</p>
            </div>
            <Link
              href="/browse"
              className="text-sm text-brand-600 font-semibold hover:underline flex items-center gap-1"
            >
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {!nearbyProviders?.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-brand-300" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">No providers in your city yet</h3>
              <p className="text-sm text-gray-400 mb-6">Try browsing all providers to find someone who can help.</p>
              <Link href="/browse" className="btn-secondary text-sm py-2.5">
                <Search size={15} />
                Browse All Providers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyProviders.map((p) => (
                <Link
                  key={p.id}
                  href={`/provider/${p.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all p-5 flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-lg font-black text-brand-700 flex-shrink-0 overflow-hidden">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" />
                    ) : (
                      p.full_name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-bold text-gray-900 text-sm truncate group-hover:text-brand-700 transition-colors">{p.full_name}</p>
                      {p.is_verified && <BadgeCheck size={14} className="text-brand-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {p.skills?.map((s: { skill_name: string }) => s.skill_name).join(', ') || 'No skills listed'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <MapPin size={10} /> {p.city}
                      </span>
                      {p.skills?.[0]?.hourly_rate && (
                        <span className="text-xs font-bold text-brand-600">
                          ${p.skills[0].hourly_rate}/hr
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

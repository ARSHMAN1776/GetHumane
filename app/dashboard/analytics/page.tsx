import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Star, Calendar, TrendingUp, Users, Eye, Zap, BadgeCheck } from 'lucide-react'
import { createServerClient, getCurrentUser } from '@/lib/supabase'
import TrustScore from '@/components/TrustScore'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics — GetHumane' }
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'provider') redirect('/dashboard')

  const supabase = await createServerClient()

  const [
    { data: bookings },
    { data: reviews },
    { data: skills },
  ] = await Promise.all([
    supabase.from('bookings').select('id,status,total_price,created_at,seeker:users!bookings_seeker_id_fkey(city)').eq('provider_id', user.id).order('created_at', { ascending: false }),
    supabase.from('reviews').select('rating,comment,created_at,reviewer:users!reviews_reviewer_id_fkey(full_name,photo_url)').eq('reviewee_id', user.id).order('created_at', { ascending: false }),
    supabase.from('skills').select('skill_name,hourly_rate').eq('user_id', user.id),
  ])

  const completed = (bookings ?? []).filter((b) => b.status === 'completed')
  const pending = (bookings ?? []).filter((b) => b.status === 'pending')
  const confirmed = (bookings ?? []).filter((b) => b.status === 'confirmed')
  const cancelled = (bookings ?? []).filter((b) => b.status === 'cancelled')
  const totalEarned = completed.reduce((s, b) => s + (b.total_price ?? 0) * 0.9, 0)
  const avgRating = (reviews ?? []).length
    ? (reviews!.reduce((s, r) => s + r.rating, 0) / reviews!.length).toFixed(1)
    : null

  const conversionRate = (bookings ?? []).length
    ? Math.round((completed.length / (bookings ?? []).length) * 100)
    : 0

  // Earnings by month (last 6)
  const monthlyMap: Record<string, number> = {}
  completed.forEach((b) => {
    const key = new Date(b.created_at).toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthlyMap[key] = (monthlyMap[key] ?? 0) + (b.total_price ?? 0) * 0.9
  })
  const months = Object.entries(monthlyMap).slice(-6)
  const maxEarning = Math.max(...months.map(([, v]) => v), 1)

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: (reviews ?? []).filter((r) => r.rating === star).length,
  }))
  const maxRatingCount = Math.max(...ratingDist.map((r) => r.count), 1)

  const statCards = [
    { label: 'Total Earned', value: `$${totalEarned.toFixed(0)}`, sub: 'after 10% platform fee', icon: <DollarSign size={20} />, color: 'bg-emerald-600' },
    { label: 'Total Bookings', value: (bookings ?? []).length, sub: `${pending.length} pending`, icon: <Calendar size={20} />, color: 'bg-brand-600' },
    { label: 'Completed', value: completed.length, sub: `${cancelled.length} cancelled`, icon: <TrendingUp size={20} />, color: 'bg-teal-600' },
    { label: 'Avg Rating', value: avgRating ? `${avgRating} ★` : '—', sub: `${(reviews ?? []).length} reviews`, icon: <Star size={20} />, color: 'bg-yellow-500' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, sub: 'bookings → completed', icon: <TrendingUp size={20} />, color: 'bg-violet-600' },
    { label: 'Active Skills', value: (skills ?? []).length, sub: `from $${Math.min(...(skills ?? [{ hourly_rate: 0 }]).map((s) => s.hourly_rate))}/hr`, icon: <Zap size={20} />, color: 'bg-accent-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-950 pt-24 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-800 rounded-full blur-3xl opacity-20" />
        <div className="container-app relative z-10">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium mb-5 transition-colors">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
              <p className="text-white/50 mt-1 text-sm">Your performance as a skill provider on GetHumane.</p>
            </div>
            {!(user as unknown as { is_pro?: boolean }).is_pro && (
              <Link href="/dashboard/settings?tab=pro" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border border-accent-500/40 bg-accent-500/10 hover:bg-accent-500/20 transition-colors">
                <Zap size={14} className="text-accent-400 fill-accent-400" />
                Upgrade to Pro for full analytics
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">{s.label}</p>
                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white flex-shrink-0`}>{s.icon}</div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Earnings chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5">Earnings by Month</h2>
            {months.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No completed sessions yet.</div>
            ) : (
              <div className="flex items-end gap-3 h-40">
                {months.map(([label, val]) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-2">
                    <p className="text-xs font-bold text-brand-600">${Math.round(val)}</p>
                    <div
                      className="w-full rounded-t-lg bg-brand-600 transition-all"
                      style={{ height: `${(val / maxEarning) * 100}px`, minHeight: 4 }}
                    />
                    <p className="text-xs text-gray-400 text-center leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rating distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5">Rating Breakdown</h2>
            {!(reviews ?? []).length ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No reviews yet.</div>
            ) : (
              <div className="space-y-3">
                {ratingDist.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 w-4 text-right">{star}★</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${(count / maxRatingCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-4">{count}</span>
                  </div>
                ))}
                <p className="text-center text-sm font-bold text-gray-900 pt-2">{avgRating} / 5.0</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Booking Status Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', count: pending.length, color: 'bg-amber-100 text-amber-700 border-amber-200' },
              { label: 'Confirmed', count: confirmed.length, color: 'bg-blue-100 text-blue-700 border-blue-200' },
              { label: 'Completed', count: completed.length, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
              { label: 'Cancelled', count: cancelled.length, color: 'bg-gray-100 text-gray-500 border-gray-200' },
            ].map((s) => (
              <div key={s.label} className={`border rounded-xl p-4 text-center ${s.color}`}>
                <p className="text-3xl font-bold">{s.count}</p>
                <p className="text-sm font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Score */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Your Trust Score</h2>
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <TrustScore
              is_verified={!!user.is_verified}
              bg_check_clear={(user as any).background_check_status === 'clear'}
              avg_rating={avgRating ? parseFloat(avgRating) : null}
              session_count={completed.length}
              response_rate={null}
              size="lg"
              showBreakdown
            />
            <div className="flex-1 space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                Your Trust Score is shown on your public profile to seekers. Higher scores lead to more bookings.
                Complete the remaining steps to reach <strong className="text-emerald-700">Elite</strong> status (85+).
              </p>
              <div className="grid grid-cols-2 gap-3">
                {!user.is_verified && (
                  <Link href="/dashboard/settings?tab=pro" className="text-xs font-semibold px-3 py-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors text-center">
                    +30 — Verify ID
                  </Link>
                )}
                {(user as any).background_check_status !== 'clear' && (
                  <Link href="/dashboard/settings?tab=pro" className="text-xs font-semibold px-3 py-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors text-center">
                    +25 — Background Check
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent reviews */}
        {(reviews ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Recent Reviews</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {(reviews ?? []).slice(0, 5).map((r: any, i: number) => (
                <div key={i} className="px-6 py-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 flex-shrink-0 overflow-hidden">
                    {r.reviewer?.photo_url
                      ? <img src={r.reviewer.photo_url} alt="" className="w-full h-full object-cover" />
                      : r.reviewer?.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{r.reviewer?.full_name ?? 'Anonymous'}</p>
                      <span className="text-yellow-500 font-bold text-sm flex-shrink-0">{'★'.repeat(r.rating)}</span>
                    </div>
                    {r.comment && <p className="text-gray-500 text-sm">{r.comment}</p>}
                    <p className="text-gray-300 text-xs mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

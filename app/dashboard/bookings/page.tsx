'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar, Clock, MapPin, MessageSquare,
  User, Loader2, ArrowRight, Search,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import BookingActions from '@/components/BookingActions'

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
type Tab = 'all' | BookingStatus

const TABS: { label: string; value: Tab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
}

const HEADER = { background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)' }

export default function BookingsPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [role, setRole] = useState<'provider' | 'seeker' | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile) { router.push('/login'); return }

      const r = profile.role as 'provider' | 'seeker'
      const column = r === 'provider' ? 'provider_id' : 'seeker_id'
      const joinKey = r === 'provider'
        ? 'seeker:users!bookings_seeker_id_fkey(id,full_name,photo_url,city)'
        : 'provider:users!bookings_provider_id_fkey(id,full_name,photo_url,city)'

      const { data } = await supabase
        .from('bookings')
        .select(`*, ${joinKey}`)
        .eq(column, user.id)
        .order('created_at', { ascending: false })

      setRole(r)
      setBookings(data ?? [])
      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab)
  const counts = Object.fromEntries(
    (['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map(s => [
      s, bookings.filter(b => b.status === s).length,
    ])
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={HEADER} className="px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {role === 'provider' ? 'Booking Requests' : 'My Bookings'}
          </h1>
          <p className="text-emerald-300/70 text-sm mt-1">
            {bookings.length} total
            {role === 'provider'
              ? ` · ${counts.pending ?? 0} pending action`
              : ` · ${counts.confirmed ?? 0} confirmed upcoming`}
          </p>
        </div>
        <Link
          href="/browse"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold transition-all w-fit"
        >
          <Search size={15} />
          {role === 'provider' ? 'Browse Seekers' : 'Browse Providers'}
        </Link>
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 overflow-x-auto">
          {TABS.map(t => {
            const count = t.value === 'all' ? bookings.length : (counts[t.value as BookingStatus] ?? 0)
            const active = tab === t.value
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${active
                    ? 'bg-emerald-700 text-white'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                {t.label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center px-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-emerald-300" />
              </div>
              <p className="font-semibold text-gray-500">
                No {tab === 'all' ? '' : tab + ' '}bookings
              </p>
              <p className="text-sm text-gray-400 mt-1 mb-5">
                {tab === 'all' && role === 'seeker'
                  ? 'Browse providers and make your first booking.'
                  : tab === 'all' && role === 'provider'
                    ? 'Complete your profile and list your skills to attract clients.'
                    : 'Nothing to show here.'}
              </p>
              {tab === 'all' && (
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                >
                  {role === 'provider' ? 'Browse Seekers' : 'Find a Provider'}
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ) : role === 'provider' ? (
            /* Provider rows use BookingActions (confirm / decline / message) */
            <div className="divide-y divide-gray-50">
              {filtered.map(booking => (
                <BookingActions key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            /* Seeker rows — read-only with message link */
            <div className="divide-y divide-gray-50">
              {filtered.map(booking => {
                const provider = booking.provider
                return (
                  <div key={booking.id} className="px-6 py-4 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-emerald-700 overflow-hidden">
                      {provider?.photo_url ? (
                        <img src={provider.photo_url} alt={provider.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-emerald-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {provider?.full_name ?? 'Unknown provider'}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(booking.date_time).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                        <span className="text-gray-200">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          <span className="truncate max-w-[120px]">{booking.location}</span>
                        </span>
                      </p>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-sm text-gray-800">
                        ${booking.total_price?.toFixed(2)}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLOR[booking.status] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {booking.status}
                      </span>
                      {booking.status !== 'cancelled' && (
                        <Link
                          href={`/dashboard/messages/${booking.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all"
                        >
                          <MessageSquare size={13} /> Message
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, ArrowRight } from 'lucide-react'
import { createServerClient, getCurrentUser } from '@/lib/supabase'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Messages — GetHumane' }
export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default async function MessagesIndexPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createServerClient()

  /* ── Fetch all bookings the user is a party to ──────────────────────── */
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, status, date_time, provider_id, seeker_id,
      provider:users!bookings_provider_id_fkey(id,full_name,photo_url),
      seeker:users!bookings_seeker_id_fkey(id,full_name,photo_url)
    `)
    .or(`provider_id.eq.${user.id},seeker_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const bookingIds = (bookings ?? []).map(b => b.id)

  /* ── Fetch all messages for those bookings ──────────────────────────── */
  const { data: allMessages } = bookingIds.length > 0
    ? await supabase
      .from('messages')
      .select('id, booking_id, sender_id, content, created_at, read_at')
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false })
    : { data: [] as any[] }

  /* ── Build conversation map ─────────────────────────────────────────── */
  // Key: booking_id → { preview content, latest timestamp, unread count }
  const msgMap = new Map<string, { content: string; at: string; unread: number }>()

  for (const msg of (allMessages ?? [])) {
    if (!msgMap.has(msg.booking_id)) {
      // First entry per booking = latest message (sorted desc)
      msgMap.set(msg.booking_id, { content: msg.content, at: msg.created_at, unread: 0 })
    }
    // Count unread: not sent by me and not yet read
    if (msg.sender_id !== user.id && !msg.read_at) {
      const entry = msgMap.get(msg.booking_id)!
      msgMap.set(msg.booking_id, { ...entry, unread: entry.unread + 1 })
    }
  }

  /* ── Keep only bookings with at least one message, sorted by recency ── */
  const conversations = (bookings ?? [])
    .filter(b => msgMap.has(b.id))
    .sort((a, b) => {
      const ta = new Date(msgMap.get(a.id)!.at).getTime()
      const tb = new Date(msgMap.get(b.id)!.at).getTime()
      return tb - ta
    })

  const totalUnread = Array.from(msgMap.values()).reduce((sum, m) => sum + m.unread, 0)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="px-8 py-7 bg-gradient-to-r from-brand-900 to-brand-700 border-b border-brand-950">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-emerald-300/70 text-sm mt-1">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          {totalUnread > 0 && ` · ${totalUnread} unread`}
        </p>
      </div>

      <div className="px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {conversations.length === 0 ? (
            <div className="py-16 text-center px-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-emerald-300" />
              </div>
              <p className="font-semibold text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-5 max-w-xs mx-auto">
                Once you have a booking confirmed, you can message the other party from the booking details.
              </p>
              <Link
                href={user.role === 'seeker' ? '/browse' : '/dashboard/bookings'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
              >
                {user.role === 'seeker' ? 'Find a Provider' : 'View Bookings'}
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {conversations.map(booking => {
                const b = booking as any
                const other = user.id === b.provider?.id ? b.seeker : b.provider
                const msgData = msgMap.get(booking.id)!
                const hasUnread = msgData.unread > 0

                return (
                  <Link
                    key={booking.id}
                    href={`/dashboard/messages/${booking.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar + unread dot */}
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm overflow-hidden">
                        {other?.photo_url ? (
                          <img src={other.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          other?.full_name?.[0]?.toUpperCase() ?? '?'
                        )}
                      </div>
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white">
                          {msgData.unread > 9 ? '9+' : msgData.unread}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                          {other?.full_name ?? 'Unknown'}
                        </p>
                        <p className="text-[11px] text-gray-400 flex-shrink-0">
                          {new Date(msgData.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {msgData.content}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[booking.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {booking.status}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(booking.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <ArrowRight size={15} className="text-gray-300 flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

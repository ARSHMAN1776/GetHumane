'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, CheckCircle, XCircle, Loader, MessageSquare, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import ReviewForm from '@/components/ReviewForm'

interface Booking {
  id: string
  provider_id: string
  provider: { id: string; full_name: string; photo_url: string | null } | null
  date_time: string
  location: string
  total_price: number | null
  status: string
}

interface Props {
  bookings: Booking[]
  reviewedIds: string[]
  initialShow?: number
}

const STATUS_CFG: Record<string, { label: string; Icon: React.ElementType; cls: string }> = {
  pending:   { label: 'Pending',   Icon: Loader,       cls: 'bg-amber-50 text-amber-600 border border-amber-100' },
  confirmed: { label: 'Confirmed', Icon: CheckCircle,  cls: 'bg-teal-50 text-teal-600 border border-teal-100' },
  completed: { label: 'Completed', Icon: CheckCircle,  cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  cancelled: { label: 'Cancelled', Icon: XCircle,      cls: 'bg-gray-50 text-gray-400 border border-gray-100' },
}

export default function SeeMoreBookings({ bookings, reviewedIds, initialShow = 2 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? bookings : bookings.slice(0, initialShow)

  return (
    <>
      <div className="divide-y divide-gray-50">
        {shown.map(b => {
          const cfg      = STATUS_CFG[b.status] ?? STATUS_CFG.cancelled
          const reviewed = reviewedIds.includes(b.id)
          const canReview= b.status === 'completed' && !reviewed

          return (
            <div key={b.id} className="px-6 py-4 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 ring-2 ring-white shadow-sm">
                  {b.provider?.photo_url
                    ? <img src={b.provider.photo_url} alt={b.provider.full_name} className="w-full h-full object-cover" />
                    : b.provider?.full_name?.[0]?.toUpperCase()
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{b.provider?.full_name ?? 'Unknown'}</p>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={11} />
                      {new Date(b.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })},{' '}
                      {new Date(b.date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={11} />
                      <span className="truncate max-w-[160px]">{b.location}</span>
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-lg font-bold text-gray-900">${b.total_price?.toFixed(2) ?? '0.00'}</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
                    <cfg.Icon size={11} />
                    {cfg.label}
                  </span>
                  <Link
                    href={`/dashboard/messages/${b.id}`}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    title="Message"
                  >
                    <MessageSquare size={13} />
                  </Link>
                  <Link href={`/provider/${b.provider_id}`} className="text-gray-300 hover:text-emerald-500 transition-colors">
                    <ChevronRight size={17} />
                  </Link>
                </div>
              </div>

              {canReview && (
                <div className="mt-4 ml-16">
                  <ReviewForm bookingId={b.id} revieweeId={b.provider_id} revieweeName={b.provider?.full_name ?? 'this provider'} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {bookings.length > initialShow && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full py-4 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-700 border-t border-gray-100 transition-colors"
        >
          {expanded
            ? <><ChevronUp size={15} /> Show less</>
            : <>See more <ChevronDown size={15} /></>
          }
        </button>
      )}
    </>
  )
}

'use client'

/**
 * components/BookingActions.tsx
 *
 * Client component rendered inside the provider dashboard's booking list.
 * Shows booking details inline and lets the provider Confirm or Cancel
 * pending requests. Completed / cancelled bookings are read-only.
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  Clock, MapPin, MessageSquare, DollarSign, Loader2, User
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Seeker {
  id: string
  full_name: string
  photo_url: string | null
  city: string
}

interface Booking {
  id: string
  status: string
  date_time: string
  location: string
  message: string | null
  total_price: number
  seeker: Seeker | null
}

interface Props {
  booking: Booking
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'badge-orange',
  confirmed: 'badge-blue',
  completed: 'badge-green',
  cancelled: 'badge-gray',
}

export default function BookingActions({ booking: initialBooking }: Props) {
  const [booking, setBooking]     = useState(initialBooking)
  const [expanded, setExpanded]   = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const updateStatus = async (status: 'confirmed' | 'cancelled') => {
    const setLoading = status === 'confirmed' ? setConfirming : setCancelling
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Unknown error')

      setBooking((prev) => ({ ...prev, status }))
      toast.success(
        status === 'confirmed'
          ? '✅ Booking confirmed! The seeker has been notified.'
          : '❌ Booking cancelled.'
      )
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update booking.')
    } finally {
      setLoading(false)
    }
  }

  const isPending   = booking.status === 'pending'
  const isActionable = isPending

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* ── Row ───────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-brand-700 overflow-hidden">
          {booking.seeker?.photo_url ? (
            <img
              src={booking.seeker.photo_url}
              alt={booking.seeker.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={16} className="text-brand-600" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {booking.seeker?.full_name ?? 'Unknown seeker'}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
            <Clock size={11} />
            {new Date(booking.date_time).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
            <span className="text-gray-200">•</span>
            <MapPin size={11} />
            <span className="truncate max-w-[120px]">{booking.location}</span>
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-sm text-gray-800">
            ${booking.total_price?.toFixed(2)}
          </span>

          <span className={`${STATUS_STYLES[booking.status] ?? 'badge-gray'} capitalize`}>
            {booking.status}
          </span>

          {/* Confirm / Cancel for pending */}
          {isActionable && (
            <>
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={confirming || cancelling}
                title="Confirm booking"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all disabled:opacity-50"
              >
                {confirming ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCircle size={13} />
                )}
                Confirm
              </button>
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={confirming || cancelling}
                title="Cancel booking"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <XCircle size={13} />
                )}
                Decline
              </button>
            </>
          )}

          {/* Message link (any non-cancelled booking) */}
          {booking.status !== 'cancelled' && (
            <Link
              href={`/dashboard/messages/${booking.id}`}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-all"
              title="Open message thread"
            >
              <MessageSquare size={13} />
              Message
            </Link>
          )}

          {/* Toggle details */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
            title={expanded ? 'Hide details' : 'View details'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ── Expanded details panel ─────────────────────────────────────────── */}
      {expanded && (
        <div className="px-6 pb-5 pt-1 animate-fade-in">
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-100">
            <div className="space-y-3">
              <DetailRow icon={<User size={14} className="text-brand-500" />} label="Seeker">
                {booking.seeker?.full_name ?? '—'}
                {booking.seeker?.city && (
                  <span className="text-gray-400 ml-1">({booking.seeker.city})</span>
                )}
              </DetailRow>
              <DetailRow icon={<Clock size={14} className="text-brand-500" />} label="Date & Time">
                {new Date(booking.date_time).toLocaleString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </DetailRow>
              <DetailRow icon={<MapPin size={14} className="text-brand-500" />} label="Location">
                {booking.location}
              </DetailRow>
            </div>
            <div className="space-y-3">
              <DetailRow icon={<DollarSign size={14} className="text-emerald-500" />} label="Total Amount">
                <span className="font-bold text-emerald-700">${booking.total_price?.toFixed(2)}</span>
              </DetailRow>
              <DetailRow icon={<MessageSquare size={14} className="text-brand-500" />} label="Message">
                {booking.message ? (
                  <span className="text-gray-600 leading-relaxed">{booking.message}</span>
                ) : (
                  <span className="text-gray-400 italic">No message provided</span>
                )}
              </DetailRow>
            </div>
          </div>

          {/* Status-based tips */}
          {booking.status === 'pending' && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2 mt-3 font-medium">
              ⏳ This request is waiting for your response. Confirm to accept or Decline to reject.
            </p>
          )}
          {booking.status === 'confirmed' && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2 mt-3 font-medium">
              ✅ You've confirmed this booking. Make sure to meet at a public location.
            </p>
          )}
          {booking.status === 'cancelled' && (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-3">
              This booking was cancelled and is no longer active.
            </p>
          )}
          {booking.status === 'completed' && (
            <p className="text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-4 py-2 mt-3 font-medium">
              🎉 Session completed! Payment has been processed.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Helper component for labeled rows in the details panel
function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm text-gray-700 font-medium">{children}</div>
      </div>
    </div>
  )
}

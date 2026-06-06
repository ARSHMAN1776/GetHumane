'use client'

/**
 * components/BookingForm.tsx
 * Full booking form: date/time, location, message, price summary.
 * Used on /book/[id].
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, MapPin, MessageSquare, Shield, DollarSign, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ProviderProfile } from '@/types'

interface BookingFormProps {
  provider: ProviderProfile
  seekerId: string
}

export default function BookingForm({ provider, seekerId }: BookingFormProps) {
  const router = useRouter()
  const primarySkill = provider.skills?.[0]
  const hourlyRate   = primarySkill?.hourly_rate ?? 0

  // ── Form state ──────────────────────────────────────────────────────────
  const [date, setDate]         = useState('')
  const [time, setTime]         = useState('')
  const [duration, setDuration] = useState(1)  // hours
  const [location, setLocation] = useState('')
  const [message, setMessage]   = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading]   = useState(false)

  const totalPrice = hourlyRate * duration

  // Get today's date as minimum for the date picker
  const today = new Date().toISOString().split('T')[0]

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!date || !time) {
      toast.error('Please select a date and time.')
      return
    }
    if (!location.trim()) {
      toast.error('Please enter a meetup location.')
      return
    }
    if (!isPublic) {
      toast.error('For safety, all meetups must be at public places.')
      return
    }

    setLoading(true)

    try {
      const dateTime = `${date}T${time}:00`

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id:      provider.id,
          seeker_id:        seekerId,
          date_time:        dateTime,
          location,
          message,
          is_public_meetup: isPublic,
          total_price:      totalPrice,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create booking')
      }

      toast.success('Booking request sent!')
      router.push('/dashboard')

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Date & Time ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="booking-date" className="label">
            <CalendarDays size={14} className="inline mr-1.5" />
            Date
          </label>
          <input
            id="booking-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="booking-time" className="label">
            Time
          </label>
          <input
            id="booking-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input"
            required
          />
        </div>
      </div>

      {/* ── Duration ────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="booking-duration" className="label">
          Duration (hours)
        </label>
        <select
          id="booking-duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="input"
        >
          {[1, 2, 3, 4, 5, 6].map((h) => (
            <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      {/* ── Location ────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="booking-location" className="label">
          <MapPin size={14} className="inline mr-1.5" />
          Meetup Location
        </label>
        <input
          id="booking-location"
          type="text"
          placeholder="e.g. Starbucks on Main St, City Library, Central Park"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input"
          required
        />
        <p className="text-xs text-gray-400 mt-1.5">Must be a public place for your safety.</p>
      </div>

      {/* ── Message ─────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="booking-message" className="label">
          <MessageSquare size={14} className="inline mr-1.5" />
          Message to {provider.full_name.split(' ')[0]} <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="booking-message"
          rows={3}
          placeholder="Tell them a bit about what you need help with..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input resize-none"
        />
      </div>

      {/* ── Public meetup toggle ─────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <input
          id="booking-public"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
          required
        />
        <label htmlFor="booking-public" className="cursor-pointer">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800 mb-0.5">
            <Shield size={14} />
            Public meetup only
          </span>
          <span className="text-xs text-emerald-700">
            I confirm this meeting will take place at a public location. This is required for everyone's safety.
          </span>
        </label>
      </div>

      {/* ── Price Summary ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
          Price Summary
        </div>
        <div className="p-5 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>${hourlyRate}/hr × {duration} hour{duration > 1 ? 's' : ''}</span>
            <span>${(hourlyRate * duration).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Platform fee (10%)</span>
            <span>${(totalPrice * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-base">
            <span>Total</span>
            <span className="flex items-center gap-1 text-brand-600">
              <DollarSign size={16} />
              {(totalPrice * 1.1).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-4 text-base"
        id="confirm-booking-btn"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Sending Request...
          </>
        ) : (
          <>
            Confirm Booking
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        You won't be charged until the provider accepts your request.
      </p>
    </form>
  )
}

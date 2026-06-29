'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  const label = new Date(`1970-01-01T${h}:${m}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return { value: `${h}:${m}`, label }
})

interface DaySlot {
  day_of_week:  number
  start_time:   string
  end_time:     string
  is_available: boolean
}

interface Props { userId: string }

export default function AvailabilitySchedule({ userId }: Props) {
  const [schedule, setSchedule] = useState<DaySlot[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week:  i,
      start_time:   '09:00',
      end_time:     '18:00',
      is_available: i >= 1 && i <= 5,
    }))
  )
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    fetch(`/api/availability?user_id=${userId}`)
      .then(r => r.json())
      .then(j => {
        if (j.data?.length === 7) setSchedule(j.data)
      })
      .finally(() => setLoading(false))
  }, [userId])

  const toggle = (i: number) =>
    setSchedule(s => s.map((d, idx) => idx === i ? { ...d, is_available: !d.is_available } : d))

  const setTime = (i: number, field: 'start_time' | 'end_time', val: string) =>
    setSchedule(s => s.map((d, idx) => idx === i ? { ...d, [field]: val } : d))

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/availability', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(schedule),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Availability saved!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-8 flex justify-center"><Loader2 size={22} className="animate-spin text-brand-500" /></div>

  const availCount = schedule.filter(d => d.is_available).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">Weekly Schedule</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {availCount === 0 ? 'No days set — seekers will see you as unavailable' : `Available ${availCount} day${availCount !== 1 ? 's' : ''} per week`}
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>
      </div>

      <div className="space-y-2">
        {schedule.map((day, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
              day.is_available
                ? 'bg-brand-50 border-brand-200'
                : 'bg-gray-50 border-gray-100'
            }`}
          >
            {/* Toggle */}
            <button
              onClick={() => toggle(i)}
              className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${
                day.is_available ? 'bg-brand-600' : 'bg-gray-300'
              }`}
              style={{ height: 22, width: 40 }}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  day.is_available ? 'translate-x-[18px]' : 'translate-x-0'
                }`}
              />
            </button>

            {/* Day name */}
            <span className={`w-16 text-sm font-semibold flex-shrink-0 ${day.is_available ? 'text-brand-700' : 'text-gray-400'}`}>
              {SHORT[i]}
              <span className="hidden sm:inline font-normal text-xs ml-1 opacity-60">{DAYS[i].slice(3)}</span>
            </span>

            {/* Time selectors */}
            {day.is_available ? (
              <div className="flex items-center gap-2 flex-1">
                <Clock size={13} className="text-brand-400 flex-shrink-0" />
                <select
                  value={day.start_time}
                  onChange={e => setTime(i, 'start_time', e.target.value)}
                  className="text-xs bg-white border border-brand-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400 text-gray-700 cursor-pointer"
                >
                  {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <span className="text-xs text-gray-400">to</span>
                <select
                  value={day.end_time}
                  onChange={e => setTime(i, 'end_time', e.target.value)}
                  className="text-xs bg-white border border-brand-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400 text-gray-700 cursor-pointer"
                >
                  {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <span className="text-xs text-brand-500 font-medium ml-auto hidden sm:block">
                  {(() => {
                    const [sh, sm] = day.start_time.split(':').map(Number)
                    const [eh, em] = day.end_time.split(':').map(Number)
                    const hrs = ((eh * 60 + em) - (sh * 60 + sm)) / 60
                    return hrs > 0 ? `${hrs}h` : '—'
                  })()}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400 flex-1">Unavailable</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <Clock size={11} />
        Seekers see your availability when picking a booking time. All times are in your local timezone.
      </p>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Users, Calendar, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CreateGroupSessionPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [title,         setTitle]         = useState('')
  const [skillName,     setSkillName]     = useState('')
  const [description,   setDescription]   = useState('')
  const [dateTime,      setDateTime]      = useState('')
  const [location,      setLocation]      = useState('')
  const [maxCapacity,   setMaxCapacity]   = useState(8)
  const [pricePerSeat,  setPricePerSeat]  = useState(25)
  const [isPublic,      setIsPublic]      = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/groups', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, skill_name: skillName, description: description || undefined,
          date_time: new Date(dateTime).toISOString(),
          location, max_capacity: maxCapacity, price_per_seat: pricePerSeat, is_public: isPublic,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Group session created!')
      router.push('/groups')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-950 pt-24 pb-10">
        <div className="container-app">
          <Link href="/groups" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-5 transition-colors">
            <ArrowLeft size={14} /> Back to Group Sessions
          </Link>
          <h1 className="text-3xl font-bold text-white">Create a Group Session</h1>
          <p className="text-white/50 mt-1">Teach multiple people at once and earn more.</p>
        </div>
      </div>

      <div className="container-app py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Session Details</h2>

            <div>
              <label className="label">Session Title</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="input" placeholder="e.g. Beginner Guitar Workshop" />
            </div>

            <div>
              <label className="label">Skill / Category</label>
              <input required type="text" value={skillName} onChange={e => setSkillName(e.target.value)}
                className="input" placeholder="e.g. Guitar, Cooking, Yoga" />
            </div>

            <div>
              <label className="label">Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                className="input resize-none"
                placeholder="What will participants learn? What to bring? Experience level required?" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Time & Location</h2>

            <div>
              <label className="label">Date & Time</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="label">Location</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="text" value={location} onChange={e => setLocation(e.target.value)}
                  className="input pl-10" placeholder="Central Park, Austin TX / Link to Zoom" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Capacity & Pricing</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Max Capacity</label>
                <div className="relative">
                  <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" min={2} max={50} value={maxCapacity}
                    onChange={e => setMaxCapacity(+e.target.value)}
                    className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="label">Price per Seat (USD)</label>
                <div className="relative">
                  <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" min={1} value={pricePerSeat}
                    onChange={e => setPricePerSeat(+e.target.value)}
                    className="input pl-10" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input type="checkbox" id="is_public" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-brand-600" />
              <div>
                <label htmlFor="is_public" className="text-sm font-semibold text-gray-800 cursor-pointer">
                  List publicly
                </label>
                <p className="text-xs text-gray-400">Anyone can discover and join this session.</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-brand-50 border border-brand-100 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-brand-800">Potential earnings</p>
                <p className="text-xs text-brand-600">{maxCapacity} seats × ${pricePerSeat}</p>
              </div>
              <p className="text-2xl font-bold text-brand-700">${maxCapacity * pricePerSeat}</p>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full btn-primary py-3.5 justify-center gap-2 text-base">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
            {saving ? 'Creating…' : 'Create Group Session'}
          </button>
        </form>
      </div>
    </div>
  )
}

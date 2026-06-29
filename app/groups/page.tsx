'use client'

import { useState, useEffect } from 'react'
import { Users, MapPin, Calendar, Clock, Loader2, Plus, Star } from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

interface GroupSession {
  id:             string
  title:          string
  skill_name:     string
  description:    string | null
  date_time:      string
  location:       string
  max_capacity:   number
  price_per_seat: number
  status:         string
  provider:       { id: string; full_name: string; photo_url: string | null; city: string; is_verified: boolean }
  enrollments:    [{ count: number }]
}

export default function GroupSessionsPage() {
  const supabase = createBrowserClient()
  const [sessions, setSessions]   = useState<GroupSession[]>([])
  const [loading,  setLoading]    = useState(true)
  const [joining,  setJoining]    = useState<string | null>(null)
  const [role,     setRole]       = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
        setRole(profile?.role ?? null)
      }
      const res = await fetch('/api/groups')
      const json = await res.json()
      setSessions(json.data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleJoin = async (sessionId: string) => {
    setJoining(sessionId)
    try {
      const res = await fetch('/api/groups', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: sessionId, seats: 1 }),
      })
      const json = await res.json()
      if (!res.ok) { alert(json.error); return }
      alert('You\'re enrolled! Check your dashboard for details.')
    } finally {
      setJoining(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-950 pt-24 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-800 rounded-full blur-3xl opacity-20" />
        <div className="container-app relative z-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Group Sessions</h1>
              <p className="text-white/50">Learn together. Pay less. Meet new people.</p>
            </div>
            {role === 'provider' && (
              <Link href="/groups/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors">
                <Plus size={16} /> Create Session
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={28} className="animate-spin text-brand-500" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <Users size={36} className="text-brand-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No group sessions yet</h3>
            <p className="text-gray-400 mb-6">Providers: create a session. Seekers: check back soon!</p>
            {role === 'provider' && (
              <Link href="/groups/create" className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors">
                <Plus size={16} /> Create First Session
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((s) => {
              const enrolled    = s.enrollments?.[0]?.count ?? 0
              const spotsLeft   = s.max_capacity - enrolled
              const isFull      = spotsLeft <= 0
              const dateObj     = new Date(s.date_time)
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  {/* Color accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-brand-500 to-accent-500" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 leading-snug">{s.title}</h3>
                        <p className="text-xs text-brand-600 font-semibold mt-0.5">{s.skill_name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                        isFull ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isFull ? 'Full' : `${spotsLeft} spots`}
                      </span>
                    </div>

                    {s.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{s.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} className="text-gray-400" />
                        {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        <Clock size={12} className="text-gray-400 ml-1" />
                        {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin size={12} className="text-gray-400" />
                        {s.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users size={12} className="text-gray-400" />
                        {enrolled}/{s.max_capacity} enrolled
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 overflow-hidden">
                          {s.provider.photo_url
                            ? <img src={s.provider.photo_url} alt="" className="w-full h-full object-cover" />
                            : s.provider.full_name?.[0]?.toUpperCase()
                          }
                        </div>
                        <p className="text-xs font-medium text-gray-600 truncate max-w-[100px]">{s.provider.full_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-700">${s.price_per_seat}</span>
                        <span className="text-xs text-gray-400">/seat</span>
                        {role === 'seeker' && !isFull && (
                          <button
                            onClick={() => handleJoin(s.id)}
                            disabled={joining === s.id}
                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            {joining === s.id ? <Loader2 size={11} className="animate-spin" /> : null}
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

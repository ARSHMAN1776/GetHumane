'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, BadgeCheck, MapPin, ArrowRight, Loader2 } from 'lucide-react'

interface Provider {
  id: string
  full_name: string
  photo_url: string | null
  city: string
  is_verified: boolean
  minRate: number | null
  skills: { skill_name: string; hourly_rate: number }[]
}

interface Props {
  helpNeeded: string | null
  city: string | null
}

export default function PersonalizedRecs({ helpNeeded, city }: Props) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const query = helpNeeded?.trim()

  useEffect(() => {
    if (!query) return
    setLoading(true)
    fetch('/api/providers/match', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query, city: city ?? undefined, limit: 4 }),
    })
      .then(r => r.json())
      .then(j => {
        if (j.error) throw new Error(j.error)
        setProviders(j.data ?? [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [query, city])

  if (!query) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-center">
        <Sparkles size={22} className="text-brand-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-700 mb-1">AI-Powered Recommendations</p>
        <p className="text-xs text-gray-400 mb-4">Tell us what you need in your profile to get personalized provider matches.</p>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors"
        >
          Update Profile <ArrowRight size={13} />
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 flex justify-center">
        <Loader2 size={22} className="animate-spin text-brand-400" />
      </div>
    )
  }

  if (error || !providers.length) {
    return null
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-brand-500" />
          <h2 className="font-bold text-gray-900 text-sm">Recommended For You</h2>
        </div>
        <Link href="/browse" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
          See all <ArrowRight size={12} />
        </Link>
      </div>
      <div className="divide-y divide-gray-50">
        {providers.map(p => (
          <Link
            key={p.id}
            href={`/provider/${p.id}`}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 flex-shrink-0 overflow-hidden">
              {p.photo_url
                ? <img src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" />
                : p.full_name?.[0]?.toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-brand-700 transition-colors">{p.full_name}</p>
                {p.is_verified && <BadgeCheck size={13} className="text-brand-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-400 truncate">
                {p.skills.slice(0, 2).map(s => s.skill_name).join(', ')}
                {p.city && <span className="text-gray-300"> · {p.city}</span>}
              </p>
            </div>
            {p.minRate !== null && (
              <span className="text-xs font-bold text-brand-600 flex-shrink-0">${p.minRate}/hr</span>
            )}
          </Link>
        ))}
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
          <Sparkles size={10} />
          Matched based on your profile — <Link href="/onboarding/quiz" className="text-brand-500 hover:underline font-medium">take the skill quiz</Link> for better matches
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { Search, Star, CheckCircle, ArrowRight } from 'lucide-react'

interface MockProvider {
  initials: string
  color: string
  name: string
  skill: string
  category: string
  rating: number
  price: string
  verified: boolean
}

const MOCK_PROVIDERS: MockProvider[] = [
  { initials: 'SK', color: 'bg-purple-100 text-purple-700', name: 'Sarah K.',  skill: 'Grocery Shopping', category: 'Cooking & Home', rating: 4.9, price: '$18/hr', verified: true  },
  { initials: 'MT', color: 'bg-blue-100 text-blue-700',     name: 'Marcus T.', skill: 'Home Painting',     category: 'Home Projects',  rating: 4.9, price: '$35/hr', verified: true  },
  { initials: 'JR', color: 'bg-amber-100 text-amber-700',   name: 'James R.',  skill: 'Furniture Assembly',category: 'Home Projects',  rating: 4.8, price: '$28/hr', verified: false },
  { initials: 'AL', color: 'bg-teal-100 text-teal-700',     name: 'Amy L.',    skill: 'Math Tutoring',      category: 'Tutoring',       rating: 4.9, price: '$22/hr', verified: true  },
  { initials: 'EL', color: 'bg-rose-100 text-rose-700',     name: 'Emma L.',   skill: 'Piano Lessons',      category: 'Music',          rating: 5.0, price: '$40/hr', verified: true  },
  { initials: 'DK', color: 'bg-emerald-100 text-emerald-700', name: 'Dan K.',  skill: 'Gardening Help',     category: 'Gardening',      rating: 4.7, price: '$25/hr', verified: true  },
  { initials: 'OC', color: 'bg-indigo-100 text-indigo-700', name: 'Oliver C.', skill: 'French Lessons',     category: 'Tutoring',       rating: 4.9, price: '$30/hr', verified: false },
  { initials: 'SP', color: 'bg-orange-100 text-orange-700', name: 'Sophia P.', skill: 'Yoga Instruction',   category: 'Fitness',        rating: 4.9, price: '$35/hr', verified: true  },
]

const CATEGORIES = ['All', 'Tutoring', 'Music', 'Home Projects', 'Fitness', 'Cooking & Home']

export default function HeroMockup() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookedProvider, setBookedProvider] = useState<string | null>(null)

  const filteredProviders = useMemo(() => {
    return MOCK_PROVIDERS.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.skill.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    }).slice(0, 4)
  }, [selectedCategory, searchQuery])

  const handleBook = (name: string) => {
    setBookedProvider(name)
    setTimeout(() => setBookedProvider(null), 3000)
  }

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      {/* Background glow - subtle, flat, matching branding */}
      <div className="absolute inset-0 bg-brand-50/40 rounded-2xl border border-brand-100/50 -z-10" />

      {/* Browser chrome container - no shadow, clean borders */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Browser top bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
          </div>
          <div className="flex-1 mx-3 bg-white border border-gray-200 rounded-md px-3 py-1 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0" />
            <span className="text-[11px] text-gray-400 font-medium select-none">gethumane.com/browse</span>
          </div>
        </div>

        {/* App content area */}
        <div className="p-4 bg-white">
          {/* Live search input */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 mb-3 focus-within:border-brand-400 transition-colors">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for a skill near you..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[12px] text-gray-800 placeholder-gray-400 bg-transparent outline-none border-none p-0 focus:ring-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Interactive filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Provider cards grid */}
          <div className="grid grid-cols-2 gap-3 min-h-[176px]">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((p) => (
                <div
                  key={p.name}
                  onClick={() => handleBook(p.name)}
                  className="bg-white rounded-xl border border-gray-200 p-3 hover:border-brand-500 hover:bg-brand-50/10 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${p.color}`}>
                        {p.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[11px] font-bold text-gray-900 truncate">{p.name}</p>
                          {p.verified && (
                            <CheckCircle size={10} className="text-brand-600 flex-shrink-0 fill-brand-100" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{p.skill}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star size={9} className="text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-semibold text-gray-800">{p.rating}</span>
                    </div>
                    <span className="text-[10px] font-bold text-brand-700">{p.price}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[12px] text-gray-400 font-medium">No skill providers found</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Try selecting another category or clear query</p>
              </div>
            )}
          </div>

          {/* Bottom link */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {filteredProviders.length === 4 ? 'Multiple providers nearby' : `${filteredProviders.length} providers found`}
            </span>
            <span className="text-[10px] font-semibold text-brand-600 flex items-center gap-0.5 hover:text-brand-700 cursor-pointer">
              View all <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>

      {/* Floating status alert for booking simulation - flat border, no shadow */}
      {bookedProvider && (
        <div className="absolute -bottom-4 left-4 right-4 bg-brand-50 border border-brand-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 transition-all duration-300 animate-slide-up">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-900">Booking simulated!</p>
            <p className="text-[10px] text-brand-700">Connecting with {bookedProvider}...</p>
          </div>
        </div>
      )}

      {/* Floating badge top-right: Flat border, no shadow */}
      <div className="absolute -top-3 -right-3 bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Star size={11} className="text-amber-500 fill-amber-500" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-900">Highly Rated</p>
          <p className="text-[8px] text-gray-500">4.9★ Average Rating</p>
        </div>
      </div>
    </div>
  )
}

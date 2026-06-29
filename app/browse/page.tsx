'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Search, SlidersHorizontal, X, MapPin, Loader2, ChevronDown, Map, Grid } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import ProviderCard from '@/components/ProviderCard'
import type { ProviderCardData } from '@/types'

// Leaflet must be loaded client-side only (it uses window)
const ProviderMap = dynamic(() => import('@/components/ProviderMap'), { ssr: false })

// Fallback used only if the DB fetch fails
const FALLBACK_CATEGORIES = [
  { label: 'All',               emoji: '✨', keywords: [] },

  // ── Food & Drink ──────────────────────────────────────────
  { label: 'Cooking',           emoji: '🍳', keywords: ['cook','bake','cuisine','recipe','chef','food'] },
  { label: 'Baking & Pastry',   emoji: '🎂', keywords: ['bak','pastry','bread','cake','dessert'] },
  { label: 'Nutrition',         emoji: '🥗', keywords: ['nutrition','meal','diet','food','health'] },
  { label: 'Bartending',        emoji: '🍹', keywords: ['bartend','cocktail','mixology','drink'] },

  // ── Fitness & Movement ────────────────────────────────────
  { label: 'Fitness',           emoji: '💪', keywords: ['fitness','workout','training','gym','strength'] },
  { label: 'Yoga & Pilates',    emoji: '🧘', keywords: ['yoga','pilates','stretch','flexibility'] },
  { label: 'Dance',             emoji: '💃', keywords: ['dance','dancing','salsa','ballet','hip hop','tango','ballroom'] },
  { label: 'Martial Arts',      emoji: '🥋', keywords: ['martial','karate','judo','boxing','jiu-jitsu','mma','self-defense','taekwondo'] },
  { label: 'Sports Coaching',   emoji: '⚽', keywords: ['sport','tennis','football','basketball','soccer','cricket','golf','swim','run','cycling','volleyball','badminton'] },

  // ── Wellness & Mind ───────────────────────────────────────
  { label: 'Meditation',        emoji: '🌿', keywords: ['meditat','mindfulness','breathing','relaxation','stress'] },
  { label: 'Life Coaching',     emoji: '🌟', keywords: ['life coach','mindset','goal','motivation','personal development'] },
  { label: 'Massage & Bodywork',emoji: '💆', keywords: ['massage','bodywork','reflexology','reiki','acupressure'] },
  { label: 'Mental Wellness',   emoji: '🧠', keywords: ['mental','anxiety','coping','therapy support','journaling','emotional'] },

  // ── Creative Arts ─────────────────────────────────────────
  { label: 'Music',             emoji: '🎸', keywords: ['music','guitar','piano','drum','sing','violin','bass','ukulele','flute','trumpet','saxophone'] },
  { label: 'Painting & Drawing',emoji: '🎨', keywords: ['paint','draw','sketch','watercolour','watercolor','oil','acrylic','charcoal','canvas'] },
  { label: 'Photography',       emoji: '📷', keywords: ['photo','camera','portrait','landscape','lightroom','editing','video','film'] },
  { label: 'Arts & Crafts',     emoji: '✂️', keywords: ['craft','knit','crochet','pottery','ceramics','jewellery','jewelry','origami','scrapbook','embroidery'] },
  { label: 'Writing & Poetry',  emoji: '✍️', keywords: ['writ','poetry','creative writ','storytelling','journal','blog','copywriting'] },
  { label: 'Fashion & Styling', emoji: '👗', keywords: ['fashion','style','sewing','tailor','cloth','wardrobe','personal shopper'] },

  // ── Home & Trades ─────────────────────────────────────────
  { label: 'Home Repair',       emoji: '🔨', keywords: ['repair','fix','handyman','diy','home','maintenance'] },
  { label: 'Carpentry',         emoji: '🪵', keywords: ['carpent','woodwork','furniture','cabinet','joiner'] },
  { label: 'Gardening',         emoji: '🌱', keywords: ['garden','plant','landscape','lawn','pruning','composting','flower','vegetable'] },
  { label: 'Sewing & Textiles', emoji: '🧵', keywords: ['sew','tailor','alter','quilt','knit','crochet','textile','fabric'] },
  { label: 'Automotive',        emoji: '🚗', keywords: ['car','auto','mechanic','vehicle','driving','bike','motorcycle'] },
  { label: 'Cleaning & Organising', emoji: '🏠', keywords: ['clean','organis','organiz','tidy','declutter','home'] },

  // ── Education & Learning ──────────────────────────────────
  { label: 'Tutoring',          emoji: '📚', keywords: ['tutor','school','homework','study','student','maths','math','science','english','history'] },
  { label: 'Languages',         emoji: '🌍', keywords: ['language','english','spanish','french','arabic','chinese','hindi','german','italian','japanese','portuguese','russian','teach'] },
  { label: 'Test Prep',         emoji: '📝', keywords: ['exam','test','sat','ielts','toefl','gcse','a-level','prep'] },
  { label: 'Chess & Strategy',  emoji: '♟️', keywords: ['chess','strategy','board game','logic','puzzle'] },
  { label: 'Kids Activities',   emoji: '🧒', keywords: ['kids','children','child','play','lego','art for kids','story','drawing for kids'] },

  // ── Business & Career ─────────────────────────────────────
  { label: 'Business Coaching', emoji: '💼', keywords: ['business','entrepreneur','startup','coach','consulting','strategy'] },
  { label: 'Finance & Budgeting',emoji: '💰', keywords: ['finance','budget','account','invest','money','tax','bookkeeping'] },
  { label: 'Public Speaking',   emoji: '🎤', keywords: ['speak','presentation','toastmaster','communication','debate','confidence'] },
  { label: 'Resume & Interview',emoji: '📄', keywords: ['resume','cv','interview','career','job','linkedin','hire'] },

  // ── Technology ────────────────────────────────────────────
  { label: 'Coding',            emoji: '💻', keywords: ['code','coding','program','develop','python','javascript','web','app','software'] },
  { label: 'Design',            emoji: '🖌️', keywords: ['design','ui','ux','graphic','figma','canva','illustrator','photoshop','brand'] },
  { label: 'Digital Marketing', emoji: '📱', keywords: ['marketing','social media','seo','content','ads','instagram','tiktok','youtube'] },

  // ── Culture & Heritage ────────────────────────────────────
  { label: 'Traditional Crafts',emoji: '🏺', keywords: ['traditional','heritage','folk','cultural','weaving','pottery','craft'] },
  { label: 'Astrology & Tarot', emoji: '🔮', keywords: ['astrology','tarot','horoscope','spiritual','crystal','numerology'] },
]

const SORT_OPTIONS = [
  { value: 'rating',     label: 'Top Rated' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest First' },
]

interface DbCategory { label: string; emoji: string; keywords: string[] }

export default function BrowsePage() {
  const supabase = createBrowserClient()
  const [providers,   setProviders]   = useState<ProviderCardData[]>([])
  const [categories,  setCategories]  = useState<DbCategory[]>([{ label: 'All', emoji: '✨', keywords: [] }])
  const [loading,     setLoading]     = useState(true)
  const [catsLoading, setCatsLoading] = useState(true)
  const [query,       setQuery]       = useState('')
  const [city,        setCity]        = useState('')
  const [category,    setCategory]    = useState('All')
  const [maxPrice,    setMaxPrice]    = useState(500)
  const [minRating,   setMinRating]   = useState(0)
  const [sortBy,      setSortBy]      = useState('rating')
  const [showAdv,     setShowAdv]     = useState(false)
  const [viewMode,    setViewMode]    = useState<'grid' | 'map'>('grid')

  // Load skill categories from DB
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await supabase
          .from('skill_categories')
          .select('label, emoji, keywords')
          .order('sort_order', { ascending: true })

        if (data && data.length > 0) {
          setCategories([
            { label: 'All', emoji: '✨', keywords: [] },
            ...data.map((d: any) => ({ label: d.label, emoji: d.emoji, keywords: d.keywords ?? [] })),
          ])
        } else {
          setCategories([{ label: 'All', emoji: '✨', keywords: [] }, ...FALLBACK_CATEGORIES.slice(1)])
        }
      } catch (err) {
        console.error('Error loading categories:', err)
        setCategories([{ label: 'All', emoji: '✨', keywords: [] }, ...FALLBACK_CATEGORIES.slice(1)])
      } finally {
        setCatsLoading(false)
      }
    }
    loadCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const fetchProviders = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('users')
      .select(`id,full_name,photo_url,city,is_verified,bio,
        skills(id,user_id,skill_name,hourly_rate,description,created_at),
        reviews_received:reviews!reviews_reviewee_id_fkey(rating)`)
      .eq('role', 'provider')

    if (city.trim())  q = q.ilike('city', `%${city.trim()}%`)
    const { data, error } = await q
    if (error) { setLoading(false); return }

    let list: ProviderCardData[] = (data ?? []).map((p: any) => {
      const revs = p.reviews_received ?? []
      return {
        id: p.id, full_name: p.full_name, photo_url: p.photo_url,
        city: p.city, is_verified: p.is_verified, bio: p.bio,
        skills: p.skills ?? [],
        avg_rating:   revs.length ? revs.reduce((s: number, r: any) => s + r.rating, 0) / revs.length : 0,
        review_count: revs.length,
      }
    })

    if (query.trim()) {
      const q2 = query.toLowerCase()
      list = list.filter(p =>
        p.full_name?.toLowerCase().includes(q2) ||
        p.skills.some(s => s.skill_name.toLowerCase().includes(q2)) ||
        p.bio?.toLowerCase().includes(q2)
      )
    }
    if (category !== 'All') {
      const cat = categories.find(c => c.label === category)
      const kws = cat?.keywords?.length ? cat.keywords : [category.toLowerCase()]
      list = list.filter(p => p.skills.some(s => {
        const name = s.skill_name.toLowerCase()
        return kws.some(kw => name.includes(kw))
      }))
    }
    if (maxPrice < 500)     list = list.filter(p => p.skills.some(s => s.hourly_rate <= maxPrice))
    if (minRating > 0)      list = list.filter(p => p.avg_rating >= minRating)

    if (sortBy === 'rating')     list.sort((a, b) => b.avg_rating - a.avg_rating)
    if (sortBy === 'price_asc')  list.sort((a, b) => (a.skills[0]?.hourly_rate ?? 0) - (b.skills[0]?.hourly_rate ?? 0))
    if (sortBy === 'price_desc') list.sort((a, b) => (b.skills[0]?.hourly_rate ?? 0) - (a.skills[0]?.hourly_rate ?? 0))

    setProviders(list)
    setLoading(false)
  }, [supabase, query, city, category, categories, maxPrice, minRating, sortBy])

  useEffect(() => {
    const t = setTimeout(fetchProviders, 300)
    return () => clearTimeout(t)
  }, [fetchProviders])


  const hasFilters = category !== 'All' || maxPrice < 500 || minRating > 0
  const reset = () => { setQuery(''); setCity(''); setCategory('All'); setMaxPrice(500); setMinRating(0); setSortBy('rating') }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero search bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 pt-24 pb-6">
        <div className="container-app">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Find a skilled human near you</h1>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Skill search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Guitar lessons, cooking, tutoring..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>

            {/* City */}
            <div className="relative sm:w-44">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Any city"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>

            {/* Sort */}
            <div className="relative sm:w-44">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full appearance-none pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-transparent transition-all cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowAdv(!showAdv)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                hasFilters
                  ? 'bg-brand-50 border-brand-300 text-brand-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasFilters && <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">!</span>}
            </button>
          </div>

          {/* Advanced filters — collapsible */}
          {showAdv && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Max Price</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={5} max={500} step={5} value={maxPrice}
                    onChange={e => setMaxPrice(+e.target.value)}
                    className="flex-1 accent-brand-600" />
                  <span className="text-sm font-bold text-gray-700 w-16 text-right">${maxPrice}/hr</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Min Rating</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={5} step={0.5} value={minRating}
                    onChange={e => setMinRating(+e.target.value)}
                    className="flex-1 accent-brand-600" />
                  <span className="text-sm font-bold text-gray-700 w-12 text-right">{minRating > 0 ? `${minRating}★` : 'Any'}</span>
                </div>
              </div>
              {hasFilters && (
                <div className="flex items-end">
                  <button onClick={reset} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                    <X size={14} /> Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Category pills ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-app">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {catsLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 h-9 w-24 rounded-lg bg-gray-100 animate-pulse" />
                ))
              : categories.map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => setCategory(cat.label)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      category === cat.label
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))
            }
          </div>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <div className="container-app py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={28} className="text-brand-500 animate-spin" />
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-500 mb-6 text-sm">Try a different skill, city, or clear your filters.</p>
            <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
              <X size={14} /> Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-900">{providers.length}</span> provider{providers.length !== 1 ? 's' : ''} available
                {city && <> near <span className="font-semibold text-gray-900">{city}</span></>}
              </p>
              {/* View toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid size={13} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Map size={13} /> Map
                </button>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
              </div>
            ) : (
              <ProviderMap providers={providers} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

'use client'

/**
 * app/browse/page.tsx — Browse Providers
 *
 * Search by skill or city, filter by category, price, rating.
 * Renders a grid of ProviderCard components.
 */

import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import ProviderCard from '@/components/ProviderCard'
import EmptyState from '@/components/EmptyState'
import type { ProviderCardData } from '@/types'

const SKILL_CATEGORIES = [
  'All', 'Music', 'Cooking', 'Fitness', 'Education', 'Arts',
  'Technology', 'Home & Garden', 'Language', 'Wellness', 'Other',
]

const SORT_OPTIONS = [
  { value: 'rating',   label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest',   label: 'Newest' },
]

export default function BrowsePage() {
  const supabase = createBrowserClient()

  const [providers, setProviders] = useState<ProviderCardData[]>([])
  const [loading, setLoading]     = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // ── Filter state ──────────────────────────────────────────────────────
  const [query,     setQuery]     = useState('')
  const [city,      setCity]      = useState('')
  const [category,  setCategory]  = useState('All')
  const [maxPrice,  setMaxPrice]  = useState(500)
  const [minRating, setMinRating] = useState(0)
  const [sortBy,    setSortBy]    = useState('rating')

  // ── Fetch providers ───────────────────────────────────────────────────
  const fetchProviders = useCallback(async () => {
    setLoading(true)

    let q = supabase
      .from('users')
      .select(`
        id, full_name, photo_url, city, is_verified, bio,
        skills(id, user_id, skill_name, hourly_rate, description, created_at)
      `)
      .eq('role', 'provider')

    if (city.trim())  q = q.ilike('city', `%${city.trim()}%`)
    if (query.trim()) q = q.or(
      `full_name.ilike.%${query.trim()}%`
    )

    const { data, error } = await q

    if (error) {
      console.error('Browse fetch error:', error)
      setLoading(false)
      return
    }

    // Client-side enrichment + filtering
    let enriched: ProviderCardData[] = (data ?? []).map((p) => ({
      id:           p.id,
      full_name:    p.full_name,
      photo_url:    p.photo_url,
      city:         p.city,
      is_verified:  p.is_verified,
      bio:          p.bio,
      skills:       p.skills ?? [],
      avg_rating:   Math.random() * 1.5 + 3.5, // Placeholder — replace with real avg from reviews
      review_count: Math.floor(Math.random() * 40 + 2),
    }))

    // Filter by skill keyword
    if (query.trim()) {
      const q2 = query.toLowerCase()
      enriched = enriched.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q2) ||
          p.skills.some((s) => s.skill_name.toLowerCase().includes(q2)) ||
          p.bio?.toLowerCase().includes(q2)
      )
    }

    // Filter by category
    if (category !== 'All') {
      enriched = enriched.filter((p) =>
        p.skills.some((s) => s.skill_name.toLowerCase().includes(category.toLowerCase()))
      )
    }

    // Filter by price
    enriched = enriched.filter((p) =>
      p.skills.length === 0 || p.skills.some((s) => s.hourly_rate <= maxPrice)
    )

    // Filter by min rating
    enriched = enriched.filter((p) => p.avg_rating >= minRating)

    // Sort
    if (sortBy === 'rating')       enriched.sort((a, b) => b.avg_rating - a.avg_rating)
    if (sortBy === 'price_asc')    enriched.sort((a, b) => (a.skills[0]?.hourly_rate ?? 0) - (b.skills[0]?.hourly_rate ?? 0))
    if (sortBy === 'price_desc')   enriched.sort((a, b) => (b.skills[0]?.hourly_rate ?? 0) - (a.skills[0]?.hourly_rate ?? 0))

    setProviders(enriched)
    setLoading(false)
  }, [supabase, query, city, category, maxPrice, minRating, sortBy])

  useEffect(() => {
    const timer = setTimeout(fetchProviders, 300)
    return () => clearTimeout(timer)
  }, [fetchProviders])

  const clearFilters = () => {
    setQuery('')
    setCity('')
    setCategory('All')
    setMaxPrice(500)
    setMinRating(0)
    setSortBy('rating')
  }

  const hasActiveFilters = category !== 'All' || maxPrice < 500 || minRating > 0 || city

  return (
    <div className="container-app py-10">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="page-header mb-2">Browse Skills</h1>
        <p className="text-gray-500">Find real people offering real skills near you.</p>
      </div>

      {/* ── Search bar ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="browse-search"
            type="text"
            placeholder="Search by skill, name, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-11"
          />
        </div>
        <div className="relative sm:w-48">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="browse-city"
            type="text"
            placeholder="City..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 whitespace-nowrap ${hasActiveFilters ? 'border-brand-400 text-brand-700 bg-brand-50' : ''}`}
          id="toggle-filters-btn"
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* ── Filters panel ─────────────────────────────────────────────── */}
      {showFilters && (
        <div className="card p-6 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select
                id="filter-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                {SKILL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Max price */}
            <div>
              <label className="label">Max Price: ${maxPrice}/hr</label>
              <input
                id="filter-price"
                type="range"
                min={5}
                max={500}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$5</span><span>$500</span>
              </div>
            </div>

            {/* Min rating */}
            <div>
              <label className="label">Min Rating: {minRating}★</label>
              <input
                id="filter-rating"
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Any</span><span>5★</span>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="label">Sort By</label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <X size={14} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Category pills ─────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              category === cat
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Results ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-brand-600 animate-spin" />
        </div>
      ) : providers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No providers found"
          description="Try adjusting your filters or search in a different city."
          ctaLabel="Clear Filters"
          ctaHref="/browse"
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {providers.length} provider{providers.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

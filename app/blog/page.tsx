import Link from 'next/link'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog — GetHumane' }

const posts = [
  {
    slug:      'ai-job-displacement-2025',
    category:  'Industry',
    tag:       'AI & Work',
    title:     'AI Displaced 4 Million Workers in 2025. Here\'s What They\'re Doing Next.',
    excerpt:   'New data shows the fastest-growing income source for displaced workers isn\'t a new job — it\'s turning existing skills into micro-services for their local community.',
    readTime:  '6 min read',
    date:      'June 12, 2026',
    featured:  true,
  },
  {
    slug:      'safety-public-meetups',
    category:  'Safety',
    tag:       'Trust & Safety',
    title:     'Why We Only Allow Public Meetups — And Why It Works',
    excerpt:   'Every session on GetHumane happens in a public place. No exceptions. Here\'s the data showing this policy makes everyone safer and more comfortable.',
    readTime:  '4 min read',
    date:      'May 28, 2026',
    featured:  false,
  },
  {
    slug:      'provider-success-cooking',
    category:  'Stories',
    tag:       'Provider Story',
    title:     'From Factory Line to $800/Month: Sofia\'s Cooking Side Income',
    excerpt:   'After her manufacturing job was automated, Sofia started teaching her family\'s recipes on weekends. Six months later it\'s her primary income.',
    readTime:  '5 min read',
    date:      'May 14, 2026',
    featured:  false,
  },
  {
    slug:      'trust-score-explained',
    category:  'Product',
    tag:       'Feature',
    title:     'Introducing Trust Score: What It Is and How to Improve Yours',
    excerpt:   'Trust Score is a composite reputation metric combining ID verification, background checks, ratings, and session history into a single number seekers can rely on.',
    readTime:  '3 min read',
    date:      'April 30, 2026',
    featured:  false,
  },
  {
    slug:      'skill-economy-future',
    category:  'Industry',
    tag:       'Opinion',
    title:     'The Skill Economy Is the Next Gig Economy — But Safer',
    excerpt:   'Gig platforms commoditised labour. Skill platforms humanise it. We\'re betting that the future of work is hyper-local, relationship-based, and skill-first.',
    readTime:  '7 min read',
    date:      'April 15, 2026',
    featured:  false,
  },
  {
    slug:      'background-checks-checkr',
    category:  'Safety',
    tag:       'Trust & Safety',
    title:     'How Our Background Check System Works',
    excerpt:   'GetHumane providers can opt in to a Checkr-powered background check. We explain exactly what\'s checked, what it costs, and why seekers pay attention to it.',
    readTime:  '4 min read',
    date:      'March 28, 2026',
    featured:  false,
  },
]

const TAG_COLORS: Record<string, string> = {
  'AI & Work':      'bg-violet-100 text-violet-700',
  'Trust & Safety': 'bg-emerald-100 text-emerald-700',
  'Provider Story': 'bg-amber-100 text-amber-700',
  'Feature':        'bg-brand-100 text-brand-700',
  'Opinion':        'bg-blue-100 text-blue-700',
}

export default function BlogPage() {
  const featured = posts.find(p => p.featured)!
  const rest     = posts.filter(p => !p.featured)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-gray-950 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-800 rounded-full blur-3xl opacity-20" />
        <div className="container-app relative z-10">
          <h1 className="text-4xl font-bold text-white mb-3">The GetHumane Blog</h1>
          <p className="text-white/50 max-w-lg">
            Stories, insights, and product updates from the team building the human skills economy.
          </p>
        </div>
      </div>

      <div className="container-app py-12 space-y-10">

        {/* ── Featured post ────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
          <div className="bg-gradient-to-br from-gray-950 to-gray-800 p-8 md:p-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-600 text-white uppercase tracking-wider">Featured</span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${TAG_COLORS[featured.tag] ?? 'bg-gray-100 text-gray-600'}`}>{featured.tag}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-brand-300 transition-colors leading-snug">
              {featured.title}
            </h2>
            <p className="text-white/60 mb-5 leading-relaxed max-w-2xl">{featured.excerpt}</p>
            <div className="flex items-center gap-4 text-white/40 text-xs">
              <span className="flex items-center gap-1"><Clock size={11} />{featured.readTime}</span>
              <span>{featured.date}</span>
            </div>
          </div>
          <div className="px-8 py-5 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">{featured.category}</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 group-hover:gap-2 transition-all">
              Read article <ArrowRight size={14} />
            </span>
          </div>
        </div>

        {/* ── Post grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map(post => (
            <div
              key={post.slug}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:border-brand-200 transition-all group flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[post.tag] ?? 'bg-gray-100 text-gray-600'}`}>
                    {post.tag}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-brand-700 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
              </div>
              <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={10} />{post.readTime}</span>
                  <span>{post.date}</span>
                </div>
                <span className="text-xs font-bold text-brand-600 flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                  Read <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Newsletter ────────────────────────────────────────────────────── */}
        <div className="bg-gray-950 rounded-2xl px-8 py-10 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Stay in the Loop</h2>
          <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
            New posts every two weeks. No spam, ever. Unsubscribe with one click.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-400"
            />
            <button
              className="px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

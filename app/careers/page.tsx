import Link from 'next/link'
import { ArrowRight, MapPin, Clock, Heart, Zap, Users, Shield, Globe } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Careers — GetHumane' }

const roles = [
  {
    title:      'Growth Marketing Lead',
    team:       'Marketing',
    location:   'Remote (global)',
    type:       'Full-time',
    desc:       'Own provider and seeker acquisition across SEO, paid, and community channels. Build the brand in our first 5 cities before scaling globally.',
  },
]

const perks = [
  { icon: <Globe size={18} className="text-brand-400" />,  label: 'Fully remote',         desc: 'Work from anywhere in the world' },
  { icon: <Heart size={18} className="text-brand-400" />,  label: 'Mission-driven',        desc: 'Work that actually helps people' },
  { icon: <Zap size={18} className="text-brand-400" />,    label: 'Equity',                desc: 'Share in what we\'re building' },
  { icon: <Clock size={18} className="text-brand-400" />,  label: 'Flexible hours',        desc: 'Async-first, results-driven' },
  { icon: <Shield size={18} className="text-brand-400" />, label: 'Health coverage',       desc: 'Medical, dental, vision' },
  { icon: <Users size={18} className="text-brand-400" />,  label: 'Small team, big impact',desc: 'Your work ships immediately' },
]

const TEAM_COLORS: Record<string, string> = {
  Engineering: 'bg-brand-100 text-brand-700',
  Design:      'bg-violet-100 text-violet-700',
  Operations:  'bg-emerald-100 text-emerald-700',
  Marketing:   'bg-amber-100 text-amber-700',
}

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-gray-950 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-800 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-brand-700 rounded-full blur-3xl opacity-10" />
        <div className="container-app relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white/70 mb-5">
            <Heart size={13} className="text-brand-400 fill-brand-400" />
            We're hiring
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight">
            Help us build the human skills economy
          </h1>
          <p className="text-white/60 max-w-lg leading-relaxed">
            GetHumane is a small team with a big mission. We're building infrastructure for a world
            where human skills matter more than job titles.
          </p>
          <div className="flex items-center gap-6 mt-8 text-sm text-white/40">
            <span>{roles.length} open roles</span>
            <span>·</span>
            <span>Fully remote</span>
            <span>·</span>
            <span>Equity offered</span>
          </div>
        </div>
      </div>

      <div className="container-app py-16 space-y-16">

        {/* ── Perks ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {perks.map(p => (
            <div key={p.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                {p.icon}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Open roles ───────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Roles</h2>
          <div className="space-y-3 pb-2">
            {roles.map(role => (
              <div
                key={role.title}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:border-brand-200 hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                        {role.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${TEAM_COLORS[role.team] ?? 'bg-gray-100 text-gray-600'}`}>
                        {role.team}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">{role.desc}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin size={11} />{role.location}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{role.type}</span>
                    </div>
                  </div>
                  <Link
                    href={`/contact?topic=careers&role=${encodeURIComponent(role.title)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all flex-shrink-0 group-hover:gap-3"
                    style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
                  >
                    Apply <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── No role? ─────────────────────────────────────────────────────── */}
        <div className="bg-gray-950 rounded-2xl px-8 py-10 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Don't see your role?</h2>
          <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
            We always want to hear from exceptional people. Send us a note and tell us how you'd contribute.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
          >
            <Heart size={14} />
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Heart, Shield, Users, Zap, ArrowRight, BadgeCheck, Globe, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About — GetHumane' }

const team = [
  { name: 'Arshman', role: 'Founder & CEO', bio: 'Built GetHumane after watching AI displace workers in his city. Believes every human has a skill worth sharing.', initials: 'A' },
  { name: 'Sofia R.', role: 'Head of Safety', bio: 'Former community safety coordinator. Designed our public-only meetup policy and panic response system.', initials: 'S' },
  { name: 'James O.', role: 'Lead Engineer', bio: 'Full-stack engineer passionate about building products that create real-world human connections.', initials: 'J' },
]

const values = [
  { icon: <Heart size={22} className="text-brand-400" />,   title: 'Human First',    desc: 'Every decision we make starts with one question: is this good for the humans using GetHumane?' },
  { icon: <Shield size={22} className="text-brand-400" />,  title: 'Safety Always',  desc: 'Public meetups only, identity verification, background checks, and a panic button. Safety is not optional.' },
  { icon: <Users size={22} className="text-brand-400" />,   title: 'Real Community', desc: "We're not a gig app. We're a neighborhood. Every session is a human connection, not a transaction." },
  { icon: <Zap size={22} className="text-brand-400" />,     title: 'Empower People', desc: 'AI took jobs. We help people turn their skills into income — on their terms, at their pace.' },
]

const stats = [
  { value: '4,200+', label: 'Waitlist signups' },
  { value: '50+',    label: 'Skill categories' },
  { value: '3',      label: 'Countries targeted' },
  { value: '100%',   label: 'Public meetups only' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gray-950 pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-800 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-brand-700 rounded-full blur-3xl opacity-10" />
        </div>
        <div className="container-app relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white/70 mb-6">
            <Heart size={13} className="text-brand-400 fill-brand-400" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
            AI took jobs.<br />
            <span className="text-brand-400">Humans still need humans.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            GetHumane was born from a simple observation: automation is displacing workers faster than society can adapt.
            We built a marketplace where human skills — cooking, music, coding, fitness — become income again.
          </p>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-app py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-brand-600 mb-1">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-16 space-y-20">

        {/* ── Mission ──────────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-5">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            To create a world where every person can earn a living from their skills — not their corporate title —
            while building genuine human connections in their own neighbourhood.
            We exist to prove that technology should bring people together, not replace them.
          </p>
        </div>

        {/* ── Values ───────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map(v => (
              <div key={v.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Story ────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gray-950 px-8 py-10">
            <h2 className="text-2xl font-bold text-white mb-4">How It Started</h2>
            <p className="text-white/60 leading-relaxed max-w-2xl">
              In 2025, we watched a factory close in our city. Three hundred people lost jobs — not to cheaper labour,
              but to automation. Many of them had incredible skills: welding, cooking, teaching, music.
              None of those skills were in demand at the job centre. But they were in demand in the neighbourhood.
            </p>
          </div>
          <div className="px-8 py-8 space-y-4 text-gray-600 leading-relaxed">
            <p>
              GetHumane started as a simple idea: what if we built a safe, local marketplace where a laid-off factory worker
              who makes incredible food on weekends could charge $30/hour to teach someone how to cook?
              Where a musician could offer guitar lessons on Saturday mornings?
              Where a retired teacher could tutor kids in maths?
            </p>
            <p>
              We built the safety layer first. Public meetups only — no home addresses shared ever.
              ID verification, background checks, mutual check-in before sessions, a panic button that texts
              your emergency contact and our safety team simultaneously.
              Only then did we build the marketplace.
            </p>
            <p className="font-semibold text-gray-900">
              The result is GetHumane — a marketplace where real people share real skills,
              face to face, safely, in your city.
            </p>
          </div>
        </div>

        {/* ── Team ─────────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">The Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map(m => (
              <div key={m.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  {m.initials}
                </div>
                <p className="font-bold text-gray-900">{m.name}</p>
                <p className="text-xs font-semibold text-brand-600 mb-3">{m.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <div className="bg-gray-950 rounded-2xl px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Join the Movement</h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            4,200+ people are already on the waitlist. Be part of the community that proves human skills still matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
            >
              <Heart size={15} className="fill-white" />
              Get Started Free
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white/70 text-sm border border-white/10 hover:border-white/25 hover:text-white transition-colors"
            >
              Browse Skills <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

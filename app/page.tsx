/**
 * app/page.tsx — Landing Page (Rich Redesign)
 *
 * Sections:
 * 1. Hero — dark gradient, clear value prop
 * 2. Problem — the "why" story
 * 3. Who It's For — two sides explained
 * 4. How It Works — visual 3-step
 * 5. Skill Categories — browsable grid
 * 6. Testimonials — social proof
 * 7. Trust & Safety
 * 8. Stats bar
 * 9. Final CTA / Waitlist
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Users, Briefcase, Shield, Star,
  CheckCircle, MapPin, Clock, Heart, Zap, Lock,
  AlertTriangle, PhoneCall, Search, ChevronRight,
  TrendingDown, Handshake, Sparkles,
  BookOpen, Music, Utensils, Dumbbell, Code2,
  Palette, Leaf, Camera, MessageSquare, Languages,
} from 'lucide-react'

import WaitlistForm from './_components/WaitlistForm'

export const metadata: Metadata = {
  title: 'GetHumane — Connect with Real People, Real Skills',
  description: 'AI replaced jobs. We help people earn again by sharing skills — and help others find genuine human connection near them. Book a face-to-face session today.',
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const skillCategories = [
  { icon: <Music size={22} />, label: 'Music Lessons', color: 'bg-purple-100 text-purple-700', count: '340+' },
  { icon: <Utensils size={22} />, label: 'Cooking & Baking', color: 'bg-amber-100 text-amber-700', count: '280+' },
  { icon: <BookOpen size={22} />, label: 'Tutoring', color: 'bg-blue-100 text-blue-700', count: '520+' },
  { icon: <Leaf size={22} />, label: 'Gardening', color: 'bg-emerald-100 text-emerald-700', count: '190+' },
  { icon: <Dumbbell size={22} />, label: 'Fitness & Yoga', color: 'bg-red-100 text-red-700', count: '210+' },
  { icon: <Code2 size={22} />, label: 'Coding Help', color: 'bg-indigo-100 text-indigo-700', count: '160+' },
  { icon: <Palette size={22} />, label: 'Art & Drawing', color: 'bg-pink-100 text-pink-700', count: '175+' },
  { icon: <Camera size={22} />, label: 'Photography', color: 'bg-cyan-100 text-cyan-700', count: '130+' },
  { icon: <Languages size={22} />, label: 'Language Teaching', color: 'bg-yellow-100 text-yellow-700', count: '220+' },
  { icon: <Heart size={22} />, label: 'Companionship', color: 'bg-rose-100 text-rose-700', count: '95+' },
  { icon: <MessageSquare size={22} />, label: 'Life Coaching', color: 'bg-violet-100 text-violet-700', count: '115+' },
  { icon: <Zap size={22} />, label: 'Home Repair', color: 'bg-orange-100 text-orange-700', count: '240+' },
]

const testimonials = [
  {
    text: "I lost my job at a marketing firm when they replaced my entire team with AI tools. GetHumane let me turn my 10 years of photography into real income again — I made $1,200 in my first month.",
    name: 'Sandra M.',
    role: 'Skill Provider',
    city: 'Austin, TX',
    skill: 'Photography & Headshots',
    rating: 5,
    avatar: '📷',
  },
  {
    text: "My son has been struggling with math for years. Tutoring apps never worked — he needed a real human face to explain things. Found Jake through GetHumane and his grades went from D to B in 6 weeks.",
    name: 'Rachel T.',
    role: 'Skill Seeker',
    city: 'Chicago, IL',
    skill: 'Maths Tutoring',
    rating: 5,
    avatar: '📚',
  },
  {
    text: "I'm a retired chef who got bored at home. Now I teach home cooking three times a week, I've made new friends, and I earn enough for a vacation. This platform gave me purpose again.",
    name: 'Carlo B.',
    role: 'Skill Provider',
    city: 'Portland, OR',
    skill: 'Italian Home Cooking',
    rating: 5,
    avatar: '🍝',
  },
]

const features = [
  {
    icon: <Users size={20} />,
    title: 'Verified Providers',
    description: 'Every provider goes through identity verification before they can accept bookings.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: <Shield size={20} />,
    title: 'Public Meetup Only',
    description: 'All sessions are required at a public location. No exceptions, no private addresses.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: <Star size={20} />,
    title: 'Transparent Reviews',
    description: 'A two-way review system keeps everyone accountable and helps great providers shine.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <Lock size={20} />,
    title: 'Secure Payments',
    description: 'Stripe-powered checkout. Your card info is never stored on our servers.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: <PhoneCall size={20} />,
    title: 'Panic Button',
    description: 'One-tap emergency alert during any active session — notifies our team and local authorities.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: <Zap size={20} />,
    title: 'Instant Booking',
    description: 'Find someone, pick a time, confirm — the whole process takes under 2 minutes.',
    color: 'bg-cyan-50 text-cyan-600',
  },
]

const stats = [
  { value: '2,400+', label: 'Skills Listed', sub: 'across all categories' },
  { value: '18', label: 'Cities', sub: 'and growing weekly' },
  { value: '4.9★', label: 'Avg Rating', sub: 'from verified reviews' },
  { value: '$0', label: 'Subscription', sub: 'pay only per booking' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO — dark immersive                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center pt-8 pb-16 bg-gray-950 overflow-hidden">
        {/* Animated glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600 glow-blob animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500 glow-blob animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-800 glow-blob opacity-20" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-app relative z-10 text-center">
          {/* Badge */}
          <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white/80 mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="text-accent-400" />
            <span>The Human-First Skills Marketplace</span>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up-d1 text-5xl sm:text-6xl md:text-8xl font-black text-white leading-[1.0] tracking-tight mb-6">
            AI took jobs.
            <br />
            <span className="gradient-text">Humans still need humans.</span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-slide-up-d2 text-lg md:text-2xl text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto">
            GetHumane connects people who lost their jobs to AI with people who need genuine human skills — cooking, tutoring, music, fitness, and more. Meet face-to-face. Build something real.
          </p>

          {/* CTAs */}
          <div className="animate-slide-up-d3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/signup"
              className="btn-white text-lg px-8 py-4 shadow-2xl group"
              id="hero-cta-offer"
            >
              <Briefcase size={20} className="text-brand-600" />
              I Want to Offer a Skill
              <ArrowRight size={18} className="text-brand-600 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 text-lg px-8 py-4 rounded-xl font-semibold text-white border border-white/25 hover:bg-white/10 transition-all group"
              id="hero-cta-find"
            >
              <Search size={20} />
              Find a Human Near Me
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust micro-signals */}
          <div className="animate-fade-in flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-400" /> No subscription needed</span>
            <span className="flex items-center gap-1.5"><Shield size={14} className="text-brand-400" /> Public meetups only</span>
            <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-400" /> 4.9★ average rating</span>
          </div>
        </div>

        {/* Floating Provider cards */}
        <div className="container-app relative z-10 mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { emoji: '🎸', name: 'Marcus J.', skill: 'Guitar Lessons', city: 'Austin', rating: 4.9, price: 35, delay: '0s' },
            { emoji: '🍳', name: 'Priya K.', skill: 'Home Cooking', city: 'Chicago', rating: 5.0, price: 45, delay: '0.15s' },
            { emoji: '🌿', name: 'Sofia R.', skill: 'Yoga & Wellness', city: 'Denver', rating: 4.8, price: 40, delay: '0.3s' },
          ].map((card) => (
            <div
              key={card.name}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/15 transition-all animate-float"
              style={{ animationDelay: card.delay }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                {card.emoji}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{card.name}</p>
                <p className="text-xs text-brand-300 font-medium">{card.skill}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-white/40 flex items-center gap-1"><MapPin size={9} />{card.city}</span>
                  <span className="text-xs text-amber-400 font-semibold">★{card.rating}</span>
                  <span className="text-xs font-bold text-white">${card.price}/hr</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 2. THE PROBLEM — why we exist                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-sm font-semibold text-red-700 mb-6">
              <TrendingDown size={14} />
              The Problem We're Solving
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
              AI is replacing people.<br />
              <span className="text-brand-600">But people still need people.</span>
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed">
              Millions of skilled workers — tutors, chefs, musicians, trainers — are losing income to automation. At the same time, millions of people feel lonely, stuck, and are searching for genuine human help that no app can provide. GetHumane bridges that gap.
            </p>
          </div>

          {/* Two-column problem/solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-red-50 border border-red-100 p-8">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-5">
                <TrendingDown size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">The Displaced Worker</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                You have years of real skills — teaching, cooking, fitness, music, design. AI replaced your job, but it can't replace <em>you</em>. Your human touch, patience, and experience are exactly what people are looking for.
              </p>
              <ul className="space-y-2">
                {['Lost income to AI or automation', 'Skills that deserve to be paid for', 'Flexible, local, face-to-face work'].map(p => (
                  <li key={p} className="flex items-center gap-2 text-sm text-red-700 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-brand-50 border border-brand-100 p-8">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                <Handshake size={24} className="text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">The Seeker of Connection</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                You need real help — a guitar teacher who adapts to how you learn, a cooking coach who makes it fun, a fitness trainer who keeps you accountable. YouTube can't do that. Only a real human can.
              </p>
              <ul className="space-y-2">
                {['Need help AI apps can\'t provide', 'Craving genuine human interaction', 'Want safe, local, trusted sessions'].map(p => (
                  <li key={p} className="flex items-center gap-2 text-sm text-brand-700 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 3. HOW IT WORKS                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="section bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-800 glow-blob" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-800 glow-blob" />

        <div className="container-app relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white/80 mb-6">
              <Zap size={14} className="text-accent-400" />
              Simple & Fast
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              From discovery to meetup<br />
              <span className="gradient-text">in three steps</span>
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              We made it frictionless. Whether you're offering a skill or looking for one, you'll be connected in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Search size={28} className="text-brand-400" />,
                title: 'Browse Real People',
                description: 'Search by skill, city, or price. Every provider has a photo, bio, verified rating, and clear hourly rate. No vague profiles.',
                detail: 'Guitar, cooking, tutoring, yoga, coding, gardening — 50+ categories.',
                gradient: 'from-brand-900/50 to-brand-800/30',
                border: 'border-brand-800',
              },
              {
                step: '02',
                icon: <MapPin size={28} className="text-accent-400" />,
                title: 'Book a Public Meetup',
                description: 'Pick a date, time, and public location. Pay securely via Stripe. The provider confirms within 24 hours.',
                detail: 'Coffee shops, parks, libraries — always public, always safe.',
                gradient: 'from-accent-900/50 to-accent-800/30',
                border: 'border-accent-800',
              },
              {
                step: '03',
                icon: <Heart size={28} className="text-rose-400" />,
                title: 'Connect for Real',
                description: 'Show up. Learn something. Get help. Leave a review. Every session creates real value — for both sides.',
                detail: 'Rate, review, and rebook your favourite humans.',
                gradient: 'from-rose-900/50 to-rose-800/30',
                border: 'border-rose-800',
              },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent z-0 -translate-x-4" />
                )}
                <div className={`rounded-2xl bg-gradient-to-br ${step.gradient} border ${step.border} p-7 h-full`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="text-6xl font-black text-white/10 leading-none">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/60 leading-relaxed mb-4">{step.description}</p>
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 4. SKILL CATEGORIES                                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-sm font-semibold text-brand-700 mb-6">
              <Briefcase size={14} />
              What You Can Find
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Hundreds of skills,<br />one real human behind each one
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Browse by category or search for something specific. Every listing is a real person in your city.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {skillCategories.map((cat) => (
              <Link
                key={cat.label}
                href="/browse"
                className="group card p-4 flex items-center gap-3 hover:border-brand-200 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center flex-shrink-0`}>
                  {cat.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-brand-700 transition-colors">{cat.label}</p>
                  <p className="text-xs text-gray-400">{cat.count} providers</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/browse" className="btn-secondary">
              <Search size={18} />
              Browse All Skills
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 5. TESTIMONIALS                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="section bg-gray-50">
        <div className="container-app">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-sm font-semibold text-amber-700 mb-6">
              <Star size={14} />
              Real Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              People whose lives changed
            </h2>
            <p className="text-lg text-gray-500">
              From job loss to income. From loneliness to connection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-7 flex flex-col">
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 leading-relaxed mb-6 flex-1 text-[15px]">
                  &ldquo;{t.text}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center text-xl flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.skill} · {t.city}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 inline-block ${t.role === 'Skill Provider'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-accent-100 text-accent-700'
                      }`}>
                      {t.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 6. TRUST & SAFETY                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-700 mb-6">
                <Shield size={14} />
                Safety First, Always
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                We built safety into<br />
                <span className="gradient-text">every layer</span>
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Meeting strangers requires trust. We've built multiple verification and safety layers so every meetup feels as safe as meeting a friend of a friend — not a stranger from the internet.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {features.map((f) => (
                  <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className={`w-9 h-9 rounded-lg ${f.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">{f.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/safety" className="btn-secondary">
                <Shield size={18} />
                Read Our Full Safety Guide
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Right — dark safety dashboard mockup */}
            <div className="bg-gray-950 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600 glow-blob" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
                    <Shield size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Live Safety Monitor</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-emerald-400 text-xs font-semibold">All systems active</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  {[
                    { label: 'Active sessions right now', value: '247', color: 'text-emerald-400', bar: 80 },
                    { label: 'Reports resolved (24h)', value: '12', color: 'text-brand-400', bar: 40 },
                    { label: 'Verified meetups this week', value: '1,840', color: 'text-amber-400', bar: 95 },
                  ].map((item) => (
                    <div key={item.label} className="py-3 border-b border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">{item.label}</span>
                        <span className={`font-bold ${item.color}`}>{item.value}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color.replace('text-', 'bg-')} rounded-full`}
                          style={{ width: `${item.bar}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-emerald-400" />
                    <p className="text-sm font-bold text-emerald-300">Panic Button Active</p>
                  </div>
                  <p className="text-xs text-white/40">
                    One tap during any session sends your location to our safety team and local emergency services.
                  </p>
                </div>

                <div className="mt-5 flex gap-3">
                  <div className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                    <p className="text-2xl font-black text-white">0</p>
                    <p className="text-xs text-white/40 mt-1">Safety Incidents</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                    <p className="text-2xl font-black text-emerald-400">100%</p>
                    <p className="text-xs text-white/40 mt-1">Public Meetups</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 7. STATS BAR                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-brand-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.1) 75%, transparent 75%)', backgroundSize: '60px 60px' }}
        />
        <div className="container-app relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-white font-semibold mb-0.5">{stat.label}</p>
                <p className="text-brand-200 text-sm">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 8. TWO-CTA SPLIT — for providers AND seekers                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="section bg-gray-50">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Which side are you on?
            </h2>
            <p className="text-lg text-gray-500">You can be both — many of our users earn and learn at the same time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Provider card */}
            <div className="relative overflow-hidden rounded-3xl bg-gray-950 p-10 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-700 glow-blob" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-6">
                  <Briefcase size={26} />
                </div>
                <h3 className="text-2xl font-black mb-3">I Have a Skill</h3>
                <p className="text-white/60 leading-relaxed mb-6">
                  Turn your expertise into local income. Set your own rates. Work on your own schedule. Meet real people who appreciate what you know.
                </p>
                <ul className="space-y-2 mb-8">
                  {['Set your own hourly rate', 'Flexible schedule — work when you want', 'Build a rated profile that grows', 'Get paid securely via Stripe'].map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle size={14} className="text-brand-400 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn-primary w-full py-3.5 text-base">
                  <Briefcase size={18} />
                  Start Offering Skills
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Seeker card */}
            <div className="relative overflow-hidden rounded-3xl bg-brand-600 p-10 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-400 glow-blob" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <Heart size={26} fill="white" />
                </div>
                <h3 className="text-2xl font-black mb-3">I Need Help</h3>
                <p className="text-white/80 leading-relaxed mb-6">
                  Find skilled, verified locals who can teach, assist, or simply connect. Every provider is rated, reviewed, and committed to meeting safely.
                </p>
                <ul className="space-y-2 mb-8">
                  {['Browse 50+ skill categories', 'See ratings before you book', 'Safe, public meetups only', 'Pay only for what you book'].map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-white/90">
                      <CheckCircle size={14} className="text-white flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/browse" className="btn-white w-full py-3.5 text-base text-brand-700">
                  <Search size={18} />
                  Find a Human Near Me
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 9. WAITLIST — final CTA                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 bg-gray-950 overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-700 glow-blob opacity-25" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-700 glow-blob opacity-20" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="container-app relative z-10">
          <div className="max-w-xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white/80 mb-8">
              <Heart size={14} className="text-rose-400 fill-rose-400" />
              <span>Launching in new cities weekly</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
              Be first in<br />
              <span className="gradient-text">your city</span>
            </h2>
            <p className="text-xl text-white/50 mb-10 leading-relaxed">
              Join the waitlist and get early access plus a{' '}
              <strong className="text-white">free first booking credit</strong>{' '}
              when we launch near you.
            </p>

            {/* Inline form */}
            <WaitlistForm />

            <p className="mt-5 text-sm text-white/30">
              No spam. Unsubscribe any time. We launch city-by-city.
            </p>

            {/* Social proof micro-signals */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/25 text-sm">
              <span className="flex items-center gap-1.5"><Users size={14} /> 4,200+ on the waitlist</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> 18 cities queued</span>
              <span className="flex items-center gap-1.5"><Zap size={14} /> Free first booking credit</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

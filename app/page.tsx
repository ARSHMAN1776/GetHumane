import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Shield, Zap, Users, Heart,
  CheckCircle, Sparkles, Search, Briefcase
} from 'lucide-react'
import HeroMockup from '@/components/HeroMockup'
import CategoriesShowcase from '@/components/CategoriesShowcase'
import TestimonialsSlider from '@/components/TestimonialsSlider'
import FAQAccordion from '@/components/FAQAccordion'
import InteractiveSteps from '@/components/InteractiveSteps'
import ProviderMapCompact from '@/components/ProviderMapCompact'
import PanicSafetySpotlight from '@/components/PanicSafetySpotlight'

export const metadata: Metadata = {
  title: 'GetHumane — Real Skills. Real People. Real Impact.',
  description: 'Connect with verified people in your city who can help you get things done—safely, reliably, and humanly.',
}

const features = [
  { Icon: Users,  bg: 'bg-emerald-50',  border: 'border-emerald-100',  ic: 'text-emerald-700', title: 'People over algorithms', desc: 'We connect you with real local people, not automated bots—so you get genuine assistance.' },
  { Icon: Shield, bg: 'bg-teal-50',     border: 'border-teal-100',     ic: 'text-teal-700',    title: 'Safety first',           desc: 'Every provider undergoes identity checks and profile reviews for a secure community.' },
  { Icon: Zap,    bg: 'bg-amber-50',    border: 'border-amber-100',    ic: 'text-amber-700',   title: 'Quick & convenient',     desc: 'Find help nearby, message easily, and coordinate details within our platform.' },
  { Icon: Heart,  bg: 'bg-rose-50',     border: 'border-rose-100',     ic: 'text-rose-700',    title: 'Human impact',           desc: 'Every booking directly supports local individuals and builds community connection.' },
]

const stats = [
  { value: '25K+', label: 'Active Humans'     },
  { value: '50K+', label: 'Skills Shared'     },
  { value: '100+', label: 'Cities Covered'    },
  { value: '98%',  label: 'Positive Feedback' },
]

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans">

      {/* ══════════════════════ HERO SECTION ═══════════════════════════════════ */}
      <section className="relative bg-gradient-to-b from-brand-50/50 via-white to-white border-b border-gray-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-200 bg-brand-50/50 text-brand-800 text-xs font-semibold w-max mb-5 select-none">
                <Sparkles size={12} className="text-brand-600" />
                <span>The Human-First Skills Marketplace</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-5">
                Real skills.<br />
                Real people.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-brand-500">Real impact.</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
                Connect with verified people in your city who can help you get things done—safely, reliably, and humanly.
              </p>

              {/* Buttons (CTAs) - Flat professional styling, no shadows */}
              <div className="flex flex-wrap gap-3 mb-4">
                <Link
                  href="/signup?role=provider"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors text-sm cursor-pointer border border-brand-600"
                >
                  <Briefcase size={15} />
                  Offer a Skill
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  <Search size={15} className="text-gray-400" />
                  Find a Skill
                  <ArrowRight size={14} className="text-gray-400" />
                </Link>
              </div>

              {/* Popular tags search list */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-8">
                <span className="font-semibold text-gray-400">Popular:</span>
                {['Music Lessons', 'Tutoring', 'Cooking & Baking', 'Gardening'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/browse?q=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-brand-50 hover:text-brand-700 transition-colors border border-gray-200/50"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-brand-600" /> No subscription needed</span>
                <span className="flex items-center gap-1.5"><Shield size={14} className="text-brand-600" /> Safe &amp; verified</span>
              </div>
            </div>

            {/* Right Interactive Mockup Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <HeroMockup />
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════ STATS SECTION ═════════════════════════════════ */}
      <section className="bg-brand-900 border-y border-brand-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-brand-800">
            {stats.map(({ value, label }, index) => (
              <div key={label} className={`text-center px-4 ${index > 1 ? 'pt-6 lg:pt-0' : ''} ${index % 2 !== 0 ? 'border-l lg:border-l-0 border-brand-800' : ''}`}>
                <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{value}</p>
                <p className="text-brand-200/80 text-xs sm:text-sm font-semibold mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ WHY GETHUMANE SECTION ════════════════════════ */}
      <section className="py-16 bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-extrabold tracking-widest uppercase text-brand-600 mb-2">Why GetHumane?</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Built for humans, <span className="text-brand-700">by humans.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ Icon, bg, border, ic, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-200 p-5 transition-colors hover:border-brand-500">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bg} border ${border}`}>
                  <Icon size={18} className={ic} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS SECTION ═════════════════════════ */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-extrabold tracking-widest uppercase text-brand-600 mb-2">Simple Process</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
              How it <span className="text-brand-700">works</span>
            </h2>
          </div>
          
          {/* Interactive Stepper Simulator */}
          <InteractiveSteps />
        </div>
      </section>

      {/* ══════════════════════ SAFETY SPOTLIGHT SECTION ═════════════════════ */}
      <section className="py-16 bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PanicSafetySpotlight />
        </div>
      </section>

      {/* ══════════════════════ POPULAR CATEGORIES SECTION ══════════════════ */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-extrabold tracking-widest uppercase text-brand-600 mb-2">Browse Categories</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Popular <span className="text-brand-700">categories</span>
            </h2>
          </div>
          <CategoriesShowcase />
        </div>
      </section>

      {/* ══════════════════════ NEIGHBORHOOD MAP SECTION ═════════════════════ */}
      <section className="py-16 bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-extrabold tracking-widest uppercase text-brand-600 mb-2">Local Neighborhoods</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
              Skill sharing right <span className="text-brand-700">near you</span>
            </h2>
          </div>
          <ProviderMapCompact />
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS SECTION ═════════════════════════ */}
      <section className="py-16 bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-extrabold tracking-widest uppercase text-brand-600 mb-2">What People Say</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Trusted by <span className="text-brand-700">thousands</span>
            </h2>
          </div>
        </div>
        <TestimonialsSlider />
      </section>

      {/* ══════════════════════ FAQ SECTION ═══════════════════════════════════ */}
      <section className="py-16 bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-extrabold tracking-widest uppercase text-brand-600 mb-2">Questions & Answers</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Frequently asked <span className="text-brand-700">questions</span>
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* ══════════════════════ CTA BANNER SECTION ═══════════════════════════ */}
      <section className="bg-brand-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Avatar stack indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex -space-x-2">
              {['bg-purple-400', 'bg-blue-400', 'bg-amber-400', 'bg-pink-400', 'bg-teal-400'].map((c, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${c} ring-2 ring-brand-900 flex items-center justify-center text-white text-[10px] font-bold`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-brand-700 ring-2 ring-brand-900 flex items-center justify-center text-white text-[9px] font-bold">
                +4K
              </div>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug mb-3">
            Join thousands of people building a more helpful world.
          </h2>
          <p className="text-brand-200 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Share your skills. Get things done. Make an impact.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-brand-900 bg-white hover:bg-brand-50 transition-colors text-sm cursor-pointer border border-white"
          >
            Get Started Today <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  )
}

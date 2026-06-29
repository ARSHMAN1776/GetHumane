import Link from 'next/link'
import {
  Search, UserCheck, CalendarCheck, MessageSquare, ShieldCheck, Star,
  BadgeCheck, CreditCard, MapPin, Clock, Zap, Heart, ArrowRight,
  CheckCircle, Lock, AlertTriangle, Phone, Users, TrendingUp,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'How It Works — GetHumane' }

const seekerSteps = [
  {
    number: '01',
    icon: <Search size={22} className="text-brand-400" />,
    title: 'Search for a Skill',
    desc: 'Browse 50+ skill categories or describe what you need in plain language. Our AI match engine finds the best-fit providers near you based on your specific needs, location, and budget.',
    detail: [
      'Search by skill, keyword, or need (e.g. "guitar lessons for beginners")',
      'Filter by price range, availability, distance, and verified status',
      'AI-powered matching surfaces providers most relevant to your request',
      'View provider profiles with Trust Score, ratings, and session history',
    ],
  },
  {
    number: '02',
    icon: <UserCheck size={22} className="text-brand-400" />,
    title: 'Review & Choose a Provider',
    desc: 'Every provider has a public profile with their Trust Score — a composite metric combining identity verification, background check, ratings, and session history. No guesswork.',
    detail: [
      'Read verified reviews from real past sessions',
      'Check Trust Score: ID verified, background-checked, rating, sessions completed',
      'See their availability calendar before reaching out',
      'Message providers directly — no phone numbers or addresses exchanged',
    ],
  },
  {
    number: '03',
    icon: <CalendarCheck size={22} className="text-brand-400" />,
    title: 'Book & Pay Securely',
    desc: 'Pick a time slot from the provider\'s live availability calendar. Payment is held in escrow — the provider only receives funds after the session is confirmed complete by both parties.',
    detail: [
      'Select a date and time from real-time availability',
      'Payment held in escrow via Stripe — never released early',
      'Receive booking confirmation and session details by email',
      'Both parties must check in within 10 minutes of session start',
    ],
  },
  {
    number: '04',
    icon: <MapPin size={22} className="text-brand-400" />,
    title: 'Meet in a Public Place',
    desc: 'All sessions happen in public venues — libraries, cafes, parks. No home addresses are ever shared on the platform. You agree on a public meeting point through in-app messaging.',
    detail: [
      'No private address sharing — ever',
      'Agree on a public venue through secure in-app messaging',
      'Use the check-in system when you arrive to confirm the session',
      'Panic button available throughout every session',
    ],
  },
  {
    number: '05',
    icon: <Star size={22} className="text-brand-400" />,
    title: 'Review & Grow',
    desc: 'After the session, both parties leave verified reviews. Your feedback improves the community and helps great providers rise to the top. Payments are released once both sides confirm completion.',
    detail: [
      'Leave a star rating and written review (shows on provider\'s profile)',
      'Provider also reviews you — builds mutual accountability',
      'Escrow funds released to provider within 24 hours of completion',
      'Dispute resolution available if anything goes wrong',
    ],
  },
]

const providerSteps = [
  {
    number: '01',
    icon: <UserCheck size={22} className="text-brand-500" />,
    title: 'Create Your Profile',
    desc: 'Sign up, list your skills, and set your hourly rate. Add a bio, your availability, and the areas you serve. Your profile is your storefront.',
    detail: [
      'List up to 10 skills across any category',
      'Set your own hourly rate (you keep ~92% after fees)',
      'Write a bio that tells seekers who you are',
      'Connect your availability calendar so bookings auto-sync',
    ],
  },
  {
    number: '02',
    icon: <BadgeCheck size={22} className="text-brand-500" />,
    title: 'Get Verified (Recommended)',
    desc: 'Verified providers earn 3× more bookings. Complete ID verification (free) and optionally a Checkr background check ($29.99) to unlock the Trust Score badge on your profile.',
    detail: [
      'ID verification: government ID + selfie, results in under 2 minutes',
      'Background check: Checkr-powered, takes 1–3 business days',
      'Verified badge appears on your public profile and search results',
      'Elite Trust Score unlocks a featured placement in search',
    ],
  },
  {
    number: '03',
    icon: <CalendarCheck size={22} className="text-brand-500" />,
    title: 'Set Your Availability',
    desc: 'Use the Availability tab in Settings to mark which days and hours you\'re open. Seekers see your live calendar when booking — no back-and-forth scheduling.',
    detail: [
      'Toggle availability by day of week',
      'Set start and end times per day (30-minute intervals)',
      'Update anytime — changes reflect immediately on your profile',
      'Pause availability with one click (holiday mode)',
    ],
  },
  {
    number: '04',
    icon: <MessageSquare size={22} className="text-brand-500" />,
    title: 'Accept Bookings & Meet',
    desc: 'Get notified when a seeker books you. Confirm the session, agree on a public venue via in-app messaging, and show up. The platform handles everything else.',
    detail: [
      'Receive push + email notifications for new bookings',
      'Confirm or decline within 24 hours (affects your response rate)',
      'Coordinate the public meeting spot through secure messaging',
      'Check in when you arrive — starts the session clock',
    ],
  },
  {
    number: '05',
    icon: <CreditCard size={22} className="text-brand-500" />,
    title: 'Get Paid',
    desc: 'Funds are released to your connected payout account within 24 hours of session completion. No waiting, no invoicing. Track earnings, upcoming sessions, and reviews from your analytics dashboard.',
    detail: [
      'Connect a bank account or debit card for payouts via Stripe',
      'Funds released within 24 hours of mutual completion confirmation',
      'Detailed earnings breakdown in your Analytics dashboard',
      'Monthly earnings report emailed automatically',
    ],
  },
]

const safetyFeatures = [
  {
    icon: <MapPin size={20} className="text-brand-400" />,
    title: 'Public Meetups Only',
    desc: 'No home addresses, no private venues. Every session happens in a public place — a library, coffee shop, or park. This is a hard platform rule with no exceptions.',
  },
  {
    icon: <BadgeCheck size={20} className="text-brand-400" />,
    title: 'Identity Verification',
    desc: 'Providers complete government-ID verification before their first booking. Seekers verify email. All verified users have a badge on their profile.',
  },
  {
    icon: <ShieldCheck size={20} className="text-brand-400" />,
    title: 'Background Checks',
    desc: 'Providers can opt into a Checkr-powered background check. Criminal record, sex-offender registry, global watchlist. Results shown on the Trust Score badge.',
  },
  {
    icon: <Lock size={20} className="text-brand-400" />,
    title: 'Escrow Payments',
    desc: 'Funds are never released until both parties confirm the session is complete. Disputes trigger a hold — no money moves while a dispute is open.',
  },
  {
    icon: <AlertTriangle size={20} className="text-brand-400" />,
    title: 'Panic Button',
    desc: 'A one-tap panic button in the app simultaneously texts your emergency contact and our 24/7 safety team with your last known location.',
  },
  {
    icon: <CheckCircle size={20} className="text-brand-400" />,
    title: 'Mutual Check-In',
    desc: 'Both seeker and provider must check in within 10 minutes of the session start. If either party doesn\'t check in, our safety team is alerted automatically.',
  },
]

const fees = [
  { who: 'Seekers',   fee: '0%',    detail: 'No booking fees. You pay only the provider\'s listed rate.' },
  { who: 'Providers', fee: '~8%',   detail: 'GetHumane takes an 8% service fee per completed session.' },
  { who: 'Stripe',    fee: '~2.9%', detail: 'Standard payment processing fee on each transaction.' },
]

const faqs = [
  {
    q: 'What if a session goes wrong?',
    a: 'Open a dispute from your booking card within 48 hours of the session. Our team reviews both sides and can issue a full or partial refund. Escrow funds are held until the dispute is resolved.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes. Cancel at least 24 hours before the session for a full refund. Cancellations within 24 hours are subject to a 50% fee to compensate the provider for their reserved time.',
  },
  {
    q: 'How does the AI matching work?',
    a: 'We use TF-IDF cosine similarity to match your help request (from your profile) with provider skill descriptions. The closer the language match, the higher the provider scores. No external AI APIs — fast, private, and accurate.',
  },
  {
    q: 'Is background check mandatory?',
    a: 'No — it\'s optional for providers. But providers who complete a background check earn a significant Trust Score boost and average 3× more bookings than those who don\'t.',
  },
  {
    q: 'What skills can be offered?',
    a: 'Any legal human skill: cooking, music, coding, fitness, tutoring, languages, crafts, photography, gardening, and 40+ more categories. If a person can teach it face-to-face in public, it\'s welcome on GetHumane.',
  },
  {
    q: 'How do group sessions work?',
    a: 'Providers can create group sessions (up to 12 participants) with a fixed per-seat price. Seekers join like booking a ticket. All the same safety rules apply — public venue, mutual check-in, escrow.',
  },
]

export default function HowItWorksPage() {
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
            <Zap size={13} className="text-brand-400" />
            Simple by design
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 max-w-3xl mx-auto leading-tight">
            How GetHumane Works
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            A safe, simple marketplace for real human skills. Whether you need to learn something
            or earn from what you know — here's exactly how it works, step by step.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
            >
              Find a Skill <ArrowRight size={14} />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white/70 text-sm border border-white/10 hover:border-white/30 hover:text-white transition-colors"
            >
              <Users size={14} />
              Offer Your Skill
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app py-20 space-y-24">

        {/* ── For Seekers ──────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-sm font-semibold text-brand-700 mb-4">
              <Search size={13} />
              For Seekers
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Find the help you need in 5 steps
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From search to session, we've made it as simple as possible to connect with skilled people near you.
            </p>
          </div>

          <div className="space-y-6">
            {seekerSteps.map((step, i) => (
              <div
                key={step.number}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Number + icon */}
                  <div className="md:w-48 bg-brand-50 flex flex-col items-center justify-center p-8 gap-3 flex-shrink-0">
                    <span className="text-4xl font-black text-brand-200">{step.number}</span>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      {step.icon}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.desc}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.detail.map(d => (
                        <li key={d} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── For Providers ────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-700 mb-4">
              <TrendingUp size={13} />
              For Providers
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Turn your skills into income in 5 steps
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              List your skills, set your rate, and start earning. You keep 92% of every session fee.
            </p>
          </div>

          <div className="space-y-6">
            {providerSteps.map((step, i) => (
              <div
                key={step.number}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Number + icon */}
                  <div className="md:w-48 bg-emerald-50 flex flex-col items-center justify-center p-8 gap-3 flex-shrink-0">
                    <span className="text-4xl font-black text-emerald-200">{step.number}</span>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      {step.icon}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.desc}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.detail.map(d => (
                        <li key={d} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Safety ───────────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-sm font-semibold text-red-700 mb-4">
              <ShieldCheck size={13} />
              Safety First
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built safe from the ground up</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Safety isn't a feature — it's the foundation. Every part of GetHumane was designed around
              protecting the people who use it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {safetyFeatures.map(f => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Fees ─────────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-sm font-semibold text-amber-700 mb-4">
              <CreditCard size={13} />
              Transparent Pricing
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No hidden fees</h2>
            <p className="text-gray-500">Here's exactly what each party pays on every transaction.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 px-6 py-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Who</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Fee</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detail</span>
            </div>
            {fees.map((row, i) => (
              <div
                key={row.who}
                className={`grid grid-cols-3 items-center px-6 py-5 gap-4 ${i < fees.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <span className="font-bold text-gray-900 text-sm">{row.who}</span>
                <span className="text-2xl font-black text-brand-600 text-center">{row.fee}</span>
                <span className="text-sm text-gray-500 leading-snug">{row.detail}</span>
              </div>
            ))}
            <div className="px-6 py-4 bg-brand-50 border-t border-brand-100">
              <p className="text-xs text-brand-700 font-semibold">
                Example: A $50/hr session — seeker pays $50, provider receives $46 (after 8% fee), GetHumane earns $4.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Common Questions</h2>
            <p className="text-gray-500">Still wondering something? We have answers.</p>
          </div>

          <div className="space-y-3">
            {faqs.map(faq => (
              <div key={faq.q} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <span className="text-brand-500 font-black flex-shrink-0">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <div className="bg-gray-950 rounded-2xl px-8 py-14 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Join 4,200+ people already on the waitlist. It takes under 2 minutes to create your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
            >
              <Heart size={15} className="fill-white" />
              Create Free Account
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white/70 text-sm border border-white/10 hover:border-white/30 hover:text-white transition-colors"
            >
              Browse Skills <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

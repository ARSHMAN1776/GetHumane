import type { Metadata } from 'next'
import Link from 'next/link'
import {
  HelpCircle,
  CreditCard,
  Shield,
  User,
  Search,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Mail,
  FileText,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center — GetHumane',
  description: 'Answers to common questions about GetHumane — bookings, payments, safety, and your account.',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QA {
  q: string
  a: React.ReactNode
}

interface Section {
  icon: React.ReactNode
  label: string
  title: string
  items: QA[]
}

// ─── Content ──────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Getting Started',
    title: 'Getting Started',
    items: [
      {
        q: 'What is GetHumane?',
        a: (
          <>
            GetHumane is a local skill-sharing marketplace where real people teach, learn, and exchange expertise
            face-to-face. Whether you want to pick up guitar, get help with your resume, learn to cook, or find a
            Spanish tutor — GetHumane connects you with verified community members who offer exactly that skill.
            Every session takes place in a public setting, keeping both sides safe.
          </>
        ),
      },
      {
        q: 'How do I sign up?',
        a: (
          <>
            Click <strong>Sign Up</strong> in the top navigation. You can register with your email and password.
            Once your email is confirmed, complete your profile — add a photo, a short bio, and your location so
            local providers and seekers can find you. The whole process takes under two minutes.
          </>
        ),
      },
      {
        q: 'What is the difference between a Provider and a Seeker?',
        a: (
          <>
            A <strong>Provider</strong> is someone who offers a skill or service — they list what they can teach,
            set their hourly rate, and accept booking requests. A <strong>Seeker</strong> is someone looking to
            learn or get help — they browse listings, request a session, and pay through the platform. You can
            switch roles any time from your account settings; many members are both.
          </>
        ),
      },
      {
        q: 'Is GetHumane free to join?',
        a: (
          <>
            Joining and browsing GetHumane is completely free. GetHumane charges a 10% platform fee only on
            completed bookings, deducted automatically from the Provider's payout. Seekers pay the listed rate
            with no hidden surcharges at checkout.
          </>
        ),
      },
      {
        q: 'Can I use GetHumane if I am under 18?',
        a: (
          <>
            No. GetHumane is only available to users who are 18 years of age or older. This requirement exists to
            protect our community and to comply with our payment processor's terms of service. Anyone found to be
            under 18 will have their account suspended.
          </>
        ),
      },
    ],
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    label: 'Bookings & Payments',
    title: 'Bookings & Payments',
    items: [
      {
        q: 'How does payment work?',
        a: (
          <>
            All payments are processed securely by <strong>Stripe</strong>. When you book a session, your card is
            charged immediately and the funds are held in escrow by GetHumane. Once the session is marked complete
            by both parties, the Provider's payout (minus the 10% platform fee) is released within 1–3 business
            days. GetHumane never stores your full card details.
          </>
        ),
      },
      {
        q: 'What is escrow and why does GetHumane use it?',
        a: (
          <>
            Escrow means your payment is held securely between the time you book and the time the session is
            confirmed complete. This protects Seekers from paying for a no-show and protects Providers from a
            disputed charge after delivering a session. If a dispute arises, our safety team reviews the case
            before any funds move.
          </>
        ),
      },
      {
        q: 'What is the cancellation policy?',
        a: (
          <>
            Cancellations made <strong>more than 24 hours</strong> before the session receive a full refund.
            Cancellations within 24 hours are subject to a 50% cancellation fee to compensate the Provider for
            reserving the time slot. No-shows (not cancelling at all) are non-refundable. Providers who cancel
            any session forfeit their cancellation fee protection for that booking.
          </>
        ),
      },
      {
        q: 'How do I dispute a charge?',
        a: (
          <>
            Go to <strong>Dashboard → Bookings</strong>, find the relevant booking, and tap <em>Report an
            issue</em>. Our safety team will contact both parties within 24 hours. Please provide as much
            context as possible — screenshots of messages, the agreed location, and a description of what
            happened. We aim to resolve disputes within 72 hours.
          </>
        ),
      },
      {
        q: 'Can I tip my Provider?',
        a: (
          <>
            Tipping through the platform is not currently supported, but it is on our roadmap. If you had an
            exceptional experience, the best thing you can do right now is leave a detailed five-star review —
            it directly helps the Provider attract future Seekers.
          </>
        ),
      },
    ],
  },
  {
    icon: <Shield className="w-5 h-5" />,
    label: 'Safety',
    title: 'Safety',
    items: [
      {
        q: 'How are Providers vetted?',
        a: (
          <>
            All Providers must verify their email address before listing. Providers may additionally complete
            optional <strong>identity verification</strong> (government-issued ID via Stripe Identity) and a
            voluntary <strong>background check</strong> via Checkr. Providers who complete both steps receive a
            visible <em>Verified</em> badge on their profile. We recommend choosing Verified providers,
            especially for your first session.
          </>
        ),
      },
      {
        q: 'What is the panic button?',
        a: (
          <>
            The <strong>panic button</strong> is an in-app safety feature available during any active session.
            Pressing it immediately alerts the GetHumane safety team and sends a notification to your nominated
            emergency contact with your last known location. It supplements — but does not replace — calling
            your local emergency services (911 or equivalent). Use it if you feel unsafe at any point.
          </>
        ),
      },
      {
        q: 'Are sessions required to be in public places?',
        a: (
          <>
            Yes — this is a firm platform rule. <strong>All sessions must take place in publicly accessible
            locations</strong> such as coffee shops, libraries, parks, coworking spaces, or community centres.
            Arranging meetups at private residences is strictly prohibited and may result in immediate account
            termination for both parties. This rule exists to protect everyone in our community.
          </>
        ),
      },
      {
        q: 'What should I do if I receive an inappropriate message?',
        a: (
          <>
            Use the <em>Report</em> flag inside the message thread to alert our moderation team instantly.
            You can also block the user directly from their profile. Reports are reviewed within 12 hours.
            For anything urgent or threatening, please contact local emergency services first, then let us
            know at <a href="mailto:safety@gethumane.com" className="text-brand-600 hover:underline">safety@gethumane.com</a>.
          </>
        ),
      },
      {
        q: 'How does GetHumane handle my personal data?',
        a: (
          <>
            Your data is stored securely and never sold to third parties. We share only what is necessary to
            facilitate your booking — for example, your first name and avatar are visible to the other party
            once a booking is confirmed. Read our full{' '}
            <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link> for complete
            details on what we collect and how it is used.
          </>
        ),
      },
    ],
  },
  {
    icon: <User className="w-5 h-5" />,
    label: 'Account & Settings',
    title: 'Account & Settings',
    items: [
      {
        q: 'How do I update my profile?',
        a: (
          <>
            Go to <strong>Dashboard → Settings</strong>. From there you can update your display name, bio,
            profile photo, location, and hourly rate (if you are a Provider). Changes save instantly and are
            reflected across the platform within a few minutes.
          </>
        ),
      },
      {
        q: 'How do I enable two-factor authentication (2FA)?',
        a: (
          <>
            Navigate to <strong>Dashboard → Settings → Security</strong> and toggle on{' '}
            <em>Two-Factor Authentication</em>. You will be prompted to scan a QR code with an authenticator
            app (Google Authenticator, Authy, etc.) or to receive codes via SMS. We strongly recommend enabling
            2FA — it is the single most effective step you can take to protect your account.
          </>
        ),
      },
      {
        q: 'How do I get a Verified badge?',
        a: (
          <>
            The Verified badge requires two steps: (1) complete <strong>Stripe Identity</strong> verification
            by uploading a government-issued photo ID, and (2) pass an optional <strong>Checkr background
            check</strong>. Both options are available under <strong>Dashboard → Settings → Verification</strong>.
            The badge is displayed prominently on your public profile and in search results.
          </>
        ),
      },
      {
        q: 'Can I delete my account?',
        a: (
          <>
            Yes. Go to <strong>Dashboard → Settings → Account</strong> and select <em>Delete Account</em>.
            Account deletion is permanent and will remove your profile, listings, and message history. Any
            pending payouts will be processed before deletion is finalised. Active bookings must be completed
            or cancelled before you can delete your account.
          </>
        ),
      },
    ],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function QACard({ q, a }: QA) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-900 mb-2 flex items-start gap-2">
        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">
          <ChevronRight className="w-3 h-3 text-brand-600" />
        </span>
        {q}
      </h3>
      <div className="text-gray-600 leading-relaxed pl-7 text-sm">{a}</div>
    </div>
  )
}

function SectionBlock({ section }: { section: Section }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
          {section.icon}
        </span>
        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
      </div>
      <div className="space-y-4">
        {section.items.map((item) => (
          <QACard key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </section>
  )
}

// ─── Quick-link cards ─────────────────────────────────────────────────────────

const QUICK_LINKS = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Safety Center',
    description: 'Learn about our public-meetup rule, panic button, and vetting process.',
    href: '/safety',
    cta: 'View Safety Center',
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Contact Us',
    description: "Can't find your answer? Our support team typically replies within 4 hours.",
    href: '/contact',
    cta: 'Get in Touch',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Terms of Service',
    description: 'The rules that keep our community safe, fair, and trustworthy for everyone.',
    href: '/terms',
    cta: 'Read Terms',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <>
      {/* ── Dark hero banner ── */}
      <div className="bg-gray-950 pt-24 pb-14">
        <div className="container-app max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Help Center
          </span>
          <h1 className="text-4xl font-bold text-white mb-4">How can we help?</h1>
          <p className="text-gray-400 text-base max-w-lg mx-auto mb-6">
            Find answers about bookings, payments, safety, and your account — all in one place.
          </p>

          {/* Search-style prompt linking to contact */}
          <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-sm text-gray-400">
            <Search className="w-4 h-4 text-gray-600 shrink-0" />
            <span>Can&apos;t find your answer?&nbsp;</span>
            <Link
              href="/contact"
              className="text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1 transition-colors duration-200"
            >
              Contact us
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Section jump links */}
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-3" aria-label="FAQ sections">
            {SECTIONS.map((s) => (
              <a
                key={s.label}
                href={`#${s.label.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:border-brand-700 hover:text-brand-400 text-sm font-medium transition-all duration-200"
              >
                {s.icon}
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ── FAQ body ── */}
      <div className="bg-gray-50 min-h-screen">
        <div className="container-app max-w-3xl mx-auto py-16 space-y-14">
          {SECTIONS.map((section) => (
            <div key={section.label} id={section.label.toLowerCase().replace(/\s+/g, '-')}>
              <SectionBlock section={section} />
            </div>
          ))}

          {/* ── Quick-link cards ── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">More resources</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {QUICK_LINKS.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:border-brand-200 hover:shadow-md transition-all duration-200 flex flex-col gap-4"
                >
                  <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200">
                    {card.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{card.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all duration-200">
                    {card.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Footer strip ── */}
          <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
            <Link href="/contact" className="text-sm text-brand-600 hover:underline font-medium">
              Contact support →
            </Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

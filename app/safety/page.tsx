/**
 * app/safety/page.tsx — Safety Page
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield, BadgeCheck, MapPin, AlertTriangle, Flag,
  PhoneCall, Eye, Lock, CheckCircle, ArrowRight, Heart, Mail
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Safety Center',
  description: 'Learn how GetHumane keeps every meetup safe — verification, public meetup policy, panic button, and reporting.',
}

const verificationSteps = [
  {
    icon: <Mail size={20} className="text-brand-600" />,
    title: 'Email Verification',
    desc: 'Every account must have a verified email address before they can book or accept sessions.',
  },
  {
    icon: <BadgeCheck size={20} className="text-brand-600" />,
    title: 'Government ID Upload',
    desc: 'Providers can upload a government-issued ID to earn the Verified badge, reviewed by our safety team.',
  },
  {
    icon: <Eye size={20} className="text-brand-600" />,
    title: 'Profile Review',
    desc: 'Our team manually reviews flagged profiles and investigates any user reports.',
  },
  {
    icon: <Lock size={20} className="text-brand-600" />,
    title: 'Background Checks',
    desc: 'Verified providers with the green badge have passed our background check process.',
  },
]

const meetupRules = [
  'All sessions must take place at a public location — no exceptions.',
  'Acceptable locations: coffee shops, libraries, parks, community centers.',
  'Never agree to meet at a private residence for first sessions.',
  'Tell a friend or family member where you are going.',
  'If a provider or seeker insists on a private meetup, report it immediately.',
  'Our system records the agreed meetup location for every session.',
]

const panicSteps = [
  { step: '1', title: 'Tap the panic button', desc: 'Available in the app during any active session window.' },
  { step: '2', title: 'Confirmation sent', desc: 'A silent alert is sent to our 24/7 safety team with your GPS location.' },
  { step: '3', title: 'Immediate response', desc: 'Our team calls you within 60 seconds and contacts local emergency services if needed.' },
  { step: '4', title: 'Session terminated', desc: 'The session is immediately cancelled and the other party is flagged for review.' },
]

const reportReasons = [
  'Inappropriate behaviour or harassment',
  'No-show to confirmed booking',
  'Attempts to move meetup to a private location',
  'Fake or misleading profile information',
  'Requesting payment outside the platform',
  'Any behaviour that made you feel unsafe',
]


export default function SafetyPage() {
  return (
    <div className="container-app py-12">
      <div className="max-w-4xl mx-auto">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-5">
            <Shield size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Safety Center</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Your safety is our absolute priority. We've built multiple layers of protection
            into every part of the GetHumane experience.
          </p>
        </div>

        {/* ── Quick Trust Bar ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
          {[
            { icon: <BadgeCheck size={20} className="text-brand-600" />, label: 'ID Verified Providers' },
            { icon: <MapPin size={20} className="text-emerald-600" />,   label: '100% Public Meetups' },
            { icon: <PhoneCall size={20} className="text-red-500" />,    label: '24/7 Safety Team' },
            { icon: <Flag size={20} className="text-amber-500" />,       label: 'Instant Reporting' },
          ].map((item) => (
            <div key={item.label} className="card p-4 flex flex-col items-center gap-2 text-center">
              {item.icon}
              <p className="text-xs font-semibold text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* SECTION 1: Verification                                         */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <BadgeCheck size={18} className="text-brand-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">How We Verify Users</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {verificationSteps.map((step) => (
              <div key={step.title} className="card p-5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-brand-50 border border-brand-200">
            <p className="text-sm text-brand-700">
              <strong>What does the Verified badge mean?</strong> A blue ✓ badge means the provider
              has submitted a government ID, passed a background check, and been approved by our safety team.
              Always prefer verified providers for extra peace of mind.
            </p>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* SECTION 2: Public Meetup Policy                                 */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <MapPin size={18} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Public Meetup Policy</h2>
          </div>

          <div className="card p-6 mb-5">
            <p className="text-gray-600 leading-relaxed mb-5">
              <strong>Every single session on GetHumane must take place at a public location.</strong>{' '}
              This is not optional — it is a hard requirement enforced in our booking system.
              Attempting to arrange a private meetup is grounds for immediate account suspension.
            </p>

            <ul className="space-y-3">
              {meetupRules.map((rule) => (
                <li key={rule} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* SECTION 3: Panic Button                                         */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Panic Button</h2>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-900/50 animate-pulse-slow">
                <PhoneCall size={26} />
              </div>
              <div>
                <p className="text-xl font-bold">Emergency Panic Button</p>
                <p className="text-gray-400 text-sm">One tap. Immediate response.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {panicSteps.map((s) => (
                <div key={s.step} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {s.step}
                  </span>
                  <div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">
              <strong>In a real emergency, always call 911 first.</strong> The panic button
              is a supplementary tool — do not wait for our team if you are in immediate danger.
            </p>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* SECTION 4: Report System                                         */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Flag size={18} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Report System</h2>
          </div>

          <div className="card p-6">
            <p className="text-gray-600 mb-5">
              You can report any user from their profile page at any time. Reports are reviewed
              by our safety team within <strong>2 hours</strong> during business hours and
              within 4 hours at all other times.
            </p>

            <h3 className="font-semibold text-gray-900 mb-3">Report if someone:</h3>
            <ul className="space-y-2 mb-6">
              {reportReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-3 text-sm text-gray-700">
                  <Flag size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  {reason}
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                All reports are <strong>anonymous</strong>. The reported user will not know who
                filed the report. Malicious or false reports may result in action against your account.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="card p-8 text-center bg-gradient-to-br from-brand-50 to-accent-50 border-brand-200">
          <Heart size={28} className="text-brand-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Safety is a shared responsibility
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We do everything we can to keep you safe, but we also ask that every member of
            our community commits to treating each other with respect and honesty.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/browse" className="btn-primary">
              Browse Skills Safely
              <ArrowRight size={16} />
            </Link>
            <Link href="/signup" className="btn-secondary">
              Join GetHumane
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

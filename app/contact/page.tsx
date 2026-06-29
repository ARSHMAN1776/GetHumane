'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, MessageSquare, Shield, Clock, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const TOPICS = [
  'General question',
  'Booking help',
  'Payment issue',
  'Safety concern',
  'Report a user',
  'Partnership / press',
  'Other',
]

const channels = [
  {
    icon: <Mail size={22} className="text-brand-400" />,
    title: 'Email Support',
    desc: 'For non-urgent questions. We reply within 24 hours.',
    detail: 'support@gethumane.com',
    href: 'mailto:support@gethumane.com',
  },
  {
    icon: <Shield size={22} className="text-brand-400" />,
    title: 'Safety Emergencies',
    desc: 'Active threat or unsafe session in progress.',
    detail: 'safety@gethumane.com — or use the in-app panic button',
    href: '/safety',
  },
  {
    icon: <MessageSquare size={22} className="text-brand-400" />,
    title: 'Partnerships & Press',
    desc: 'Investment, media, or business inquiries.',
    detail: 'hello@gethumane.com',
    href: 'mailto:hello@gethumane.com',
  },
]

export default function ContactPage() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [topic,   setTopic]   = useState('')
  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !topic || !message) { toast.error('Please fill in all fields'); return }
    setSending(true)
    // Simulate send — wire to Resend API in production
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-gray-950 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-800 rounded-full blur-3xl opacity-20" />
        <div className="container-app relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white/70 mb-5">
            <MessageSquare size={13} className="text-brand-400" />
            Get in Touch
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">How Can We Help?</h1>
          <p className="text-white/50 max-w-lg mx-auto">
            Real people read every message. We reply within 24 hours on business days.
          </p>
        </div>
      </div>

      <div className="container-app py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

          {/* ── Contact channels ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {channels.map(c => (
              <a
                key={c.title}
                href={c.href}
                className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-brand-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    {c.icon}
                  </div>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-brand-700 transition-colors">{c.title}</p>
                </div>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">{c.desc}</p>
                <p className="text-xs font-semibold text-brand-600">{c.detail}</p>
              </a>
            ))}

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={15} className="text-amber-600" />
                <p className="text-sm font-bold text-amber-800">Response Times</p>
              </div>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>General support — within 24 hours</li>
                <li>Safety issues — within 1 hour</li>
                <li>Payments — within 4 hours</li>
              </ul>
            </div>
          </div>

          {/* ── Contact form ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Send a Message</h2>
                <p className="text-xs text-gray-400 mt-0.5">We read every message personally.</p>
              </div>

              {sent ? (
                <div className="px-6 py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={26} className="text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Message sent!</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                    We'll get back to you at <strong>{email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setName(''); setEmail(''); setTopic(''); setMessage('') }}
                    className="text-sm font-semibold text-brand-600 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Name</label>
                      <input
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                      <input
                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Topic</label>
                    <select
                      required value={topic} onChange={e => setTopic(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white text-gray-700"
                    >
                      <option value="">Select a topic…</option>
                      {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message</label>
                    <textarea
                      required rows={6} value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Describe your issue or question in detail…"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">{message.length}/2000</p>
                  </div>

                  <button
                    type="submit" disabled={sending}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

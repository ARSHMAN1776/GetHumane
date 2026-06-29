'use client'

/**
 * components/WaitlistPopup.tsx
 * Floating "Join Waitlist" card fixed to bottom-right (bottom-center on mobile).
 * Opens a centered modal with email form on click.
 */

import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePathname } from 'next/navigation'

export default function WaitlistPopup() {
  const pathname = usePathname()
  const [modalOpen,  setModalOpen]  = useState(false)
  const [email,      setEmail]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [cardVisible, setCardVisible] = useState(false)

  // Delay card appearance slightly so it doesn't clash with page load
  useEffect(() => {
    const t = setTimeout(() => setCardVisible(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  if (pathname !== '/') return null

  const openModal = () => {
    setSubmitted(false)
    setEmail('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (loading) return
    setModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      const res  = await fetch('/api/waitlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.status === 409) {
        toast.error('This email is already on our waitlist!')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')

      setSubmitted(true)
      toast.success("You're on the list!")

      // Auto-close after 2 s
      setTimeout(() => setModalOpen(false), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating card ─────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-6 right-6 z-40 transition-all duration-700
          max-sm:right-1/2 max-sm:translate-x-1/2
          ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
        `}
        style={{ animation: cardVisible ? 'floatBounce 3s ease-in-out 2s infinite' : undefined }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer select-none
            border border-white/15 backdrop-blur-xl shadow-2xl shadow-black/40
            hover:scale-[1.04] hover:border-brand-400/40 active:scale-95
            transition-all duration-200"
          style={{ background: 'rgba(10,10,20,0.85)' }}
          onClick={openModal}
          role="button"
          aria-label="Join the GetHumane waitlist"
        >
          {/* Pulse dot */}
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500" />
          </span>

          <div className="min-w-0">
            <p className="text-white text-xs font-semibold leading-tight whitespace-nowrap">
              🚀 We're launching soon!
            </p>
            <p className="text-brand-300 text-[11px] font-medium mt-0.5 whitespace-nowrap">
              Tap to get early access
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); openModal() }}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)' }}
          >
            Join Waitlist
          </button>
        </div>
      </div>

      {/* ── Modal backdrop ────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          {/* Modal card */}
          <div
            className="relative w-full max-w-md rounded-3xl border border-white/12 shadow-2xl shadow-black/60 overflow-hidden animate-slide-up"
            style={{ background: 'linear-gradient(145deg, #0f172a 0%, #0c1628 100%)' }}
          >
            {/* Glow blob */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-brand-700 rounded-full blur-3xl opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent-700 rounded-full blur-3xl opacity-15 pointer-events-none" />

            {/* Close button */}
            <button
              onClick={closeModal}
              disabled={loading}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all z-30"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="relative z-10 p-8">
              {submitted ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center gap-4 py-6 text-center animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                    <CheckCircle size={36} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">You're on the list! 🎉</p>
                    <p className="text-white/50 text-sm">We'll notify you when we launch in your city.</p>
                  </div>
                </div>
              ) : (
                /* ── Form state ── */
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)' }}>
                      <Bell size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-tight">Get Early Access</p>
                      <p className="text-white/40 text-sm">Be first in your city at launch</p>
                    </div>
                  </div>

                  {/* Perks */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                      { emoji: '🎁', text: 'Free booking credit' },
                      { emoji: '⚡', text: 'Priority access' },
                      { emoji: '🔔', text: 'Launch alert' },
                    ].map(({ emoji, text }) => (
                      <div key={text} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/8 text-center">
                        <span className="text-xl">{emoji}</span>
                        <p className="text-[11px] text-white/50 font-medium leading-tight">{text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3" id="popup-waitlist-form">
                    <input
                      id="popup-waitlist-email"
                      type="email"
                      required
                      autoFocus
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/8 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400/50 transition text-sm"
                    />
                    <button
                      id="popup-waitlist-submit"
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-60 hover:opacity-90 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)',
                        boxShadow: '0 0 24px rgba(15,118,110,0.3)',
                      }}
                    >
                      {loading
                        ? <Loader2 size={18} className="animate-spin" />
                        : '🔔 Notify Me at Launch'}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-[11px] text-white/25">
                    No spam. Unsubscribe anytime.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Float bounce keyframe */}
      <style>{`
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @media (max-width: 639px) {
          @keyframes floatBounce {
            0%, 100% { transform: translateX(50%) translateY(0); }
            50%       { transform: translateX(50%) translateY(-6px); }
          }
        }
      `}</style>
    </>
  )
}

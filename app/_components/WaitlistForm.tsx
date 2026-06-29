'use client'

/**
 * app/_components/WaitlistForm.tsx
 * Landing page inline waitlist form.
 */

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WaitlistForm() {
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
        return
      }
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')

      setSubmitted(true)
      toast.success("You're on the list!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <p className="text-xl font-bold text-white">You're on the list! 🎉</p>
        <p className="text-white/50">We'll notify you at launch.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      id="waitlist-form"
    >
      <input
        id="waitlist-email"
        type="email"
        required
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-5 py-4 rounded-xl border-0 bg-white/10 backdrop-blur text-white placeholder-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-400/60 text-base transition"
      />
      <button
        type="submit"
        disabled={loading}
        id="waitlist-submit"
        className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base text-white transition-all disabled:opacity-60 whitespace-nowrap hover:scale-[1.02] active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 40%, #0f766e 100%)',
          boxShadow: '0 0 20px rgba(15,118,110,0.3), 0 4px 14px rgba(0,0,0,0.3)',
        }}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            Join Waitlist
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  )
}

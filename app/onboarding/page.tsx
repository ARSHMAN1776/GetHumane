'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle, Circle, Zap, BadgeCheck, Shield, Phone, ChevronRight,
  Loader2, ArrowRight, User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@/lib/supabase'

interface Step {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action?: string
  href?: string
  required?: boolean
}

const STEPS: Step[] = [
  {
    id:          'profile',
    title:       'Complete Your Profile',
    description: 'Add a bio and city so seekers can find and trust you.',
    icon:        <User size={20} />,
    href:        '/dashboard/settings',
    action:      'Edit Profile',
    required:    true,
  },
  {
    id:          'verify',
    title:       'Verify Your Identity',
    description: 'Stripe Identity verification builds seeker trust and unlocks the verified badge on your profile.',
    icon:        <BadgeCheck size={20} />,
    href:        '/dashboard/settings?tab=pro',
    action:      'Verify Now',
    required:    true,
  },
  {
    id:          'emergency',
    title:       'Add Emergency Contact',
    description: 'Required for safety. If the panic button is pressed, we contact this person alongside our safety team.',
    icon:        <Phone size={20} />,
    href:        '/dashboard/settings',
    action:      'Add Contact',
    required:    true,
  },
  {
    id:          'pro',
    title:       'Try Provider Pro',
    description: 'Get featured placement, full analytics, and priority support. Free for 14 days.',
    icon:        <Zap size={20} />,
    href:        '/dashboard/settings?tab=pro',
    action:      'Start Free Trial',
    required:    false,
  },
]

export default function OnboardingPage() {
  const router    = useRouter()
  const supabase  = createBrowserClient()
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [skipping, setSkipping]   = useState(false)

  const toggle = (id: string) =>
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const requiredDone = STEPS.filter((s) => s.required).every((s) => completed.has(s.id))
  const progress     = Math.round((completed.size / STEPS.length) * 100)

  const handleFinish = () => {
    toast.success('Setup complete! Welcome to GetHumane.')
    router.push('/dashboard')
  }

  const handleSkip = async () => {
    setSkipping(true)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-16">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-700 rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white/70 mb-5">
            <Shield size={13} className="text-brand-400" />
            Provider Setup
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Welcome to GetHumane!</h1>
          <p className="text-white/50 leading-relaxed">
            Complete these steps to activate your provider profile and start getting booked.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-white/40 mb-2">
            <span>{completed.size} of {STEPS.length} steps done</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {STEPS.map((step) => {
            const done = completed.has(step.id)
            return (
              <div
                key={step.id}
                className={`rounded-2xl border p-5 transition-all ${
                  done
                    ? 'bg-brand-900/40 border-brand-600/40'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Check */}
                  <button
                    onClick={() => toggle(step.id)}
                    className={`mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                      done ? 'text-brand-400' : 'text-white/25 hover:text-white/50'
                    }`}
                    aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {done ? <CheckCircle size={22} /> : <Circle size={22} />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`${done ? 'text-brand-300' : 'text-white'} transition-colors`}>
                        {step.icon}
                      </span>
                      <p className={`font-semibold text-sm ${done ? 'text-brand-300 line-through' : 'text-white'}`}>
                        {step.title}
                      </p>
                      {!step.required && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 ml-1">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/40 mb-3 leading-relaxed">{step.description}</p>
                    {step.href && (
                      <Link
                        href={step.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        {step.action} <ChevronRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleFinish}
            disabled={!requiredDone}
            className="flex-1 btn-primary py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle size={18} />
            Finish Setup
            <ArrowRight size={16} />
          </button>
          <button
            onClick={handleSkip}
            disabled={skipping}
            className="px-6 py-4 rounded-xl text-sm font-semibold text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20"
          >
            {skipping ? <Loader2 size={15} className="animate-spin" /> : 'Skip for now'}
          </button>
        </div>

        {!requiredDone && (
          <p className="text-center text-xs text-white/30 mt-4">
            Mark all required steps complete to finish setup.
          </p>
        )}
      </div>
    </div>
  )
}

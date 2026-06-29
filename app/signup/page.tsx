'use client'

/**
 * app/signup/page.tsx — Signup Page
 *
 * Role selector → dynamic form fields for Provider or Seeker.
 * Handles profile photo upload to Supabase Storage.
 */

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Mail, Lock, MapPin, Phone, Camera,
  Briefcase, Heart, Plus, X, Loader2, ArrowRight, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@/lib/supabase'
import type { UserRole } from '@/types'

const SKILL_SUGGESTIONS = [
  'Cooking', 'Guitar', 'Piano', 'Drawing', 'Tutoring', 'Gardening',
  'Yoga', 'Photography', 'Woodworking', 'Language Teaching', 'Coding',
  'Pet Care', 'Fitness', 'Painting', 'Baking', 'Home Repair', 'Chess',
]

export default function SignupPage() {
  const router   = useRouter()
  const supabase = createBrowserClient()
  const photoRef = useRef<HTMLInputElement>(null)

  // ── Form state ──────────────────────────────────────────────────────────
  const [role, setRole]           = useState<UserRole | null>(null)
  const [loading, setLoading]     = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Provider specific
  const [skills, setSkills]       = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [bio, setBio]             = useState('')

  // Seeker specific
  const [helpNeeded, setHelpNeeded] = useState('')

  // ── Photo handling ──────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  // ── Skill tag handling ──────────────────────────────────────────────────
  const addSkill = (name: string) => {
    const trimmed = name.trim()
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      setSkills((prev) => [...prev, trimmed])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) =>
    setSkills((prev) => prev.filter((s) => s !== skill))

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!role) { toast.error('Please select your role.'); return }

    const formData = new FormData(e.currentTarget)
    const email    = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const city     = formData.get('city') as string
    const phone    = formData.get('phone') as string

    if (role === 'provider' && skills.length === 0) {
      toast.error('Please add at least one skill.')
      return
    }

    setLoading(true)

    try {
      // 1. Supabase Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed. Please try again.')

      const userId = authData.user.id

      // 2. Upload profile photo (if provided)
      let photoUrl: string | null = null
      if (photoFile) {
        const ext      = photoFile.name.split('.').pop()
        const filePath = `${userId}/avatar.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, photoFile, { upsert: true })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)
          photoUrl = urlData.publicUrl
        }
      }

      // 3. Insert user profile
      const { error: profileError } = await supabase.from('users').insert({
        id:          userId,
        email,
        full_name:   fullName,
        role,
        city,
        phone:       phone || null,
        photo_url:   photoUrl,
        bio:         role === 'provider' ? bio || null : null,
        help_needed: role === 'seeker'   ? helpNeeded || null : null,
        is_verified: false,
      })

      if (profileError) throw profileError

      // 4. Insert skills (if provider)
      if (role === 'provider' && skills.length > 0) {
        const skillRows = skills.map((skill_name) => ({
          user_id:     userId,
          skill_name,
          hourly_rate: parseFloat(hourlyRate) || 0,
          description: null,
        }))

        const { error: skillError } = await supabase.from('skills').insert(skillRows)
        if (skillError) console.warn('Skills insert error:', skillError)
      }

      toast.success('Account created! Redirecting...')
      router.push(role === 'provider' ? '/onboarding' : '/browse')
      router.refresh()

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Role selector ────────────────────────────────────────────────────────
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Join GetHumane</h1>
            <p className="text-lg text-gray-500">How do you want to participate?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Provider */}
            <button
              onClick={() => setRole('provider')}
              id="role-provider"
              className="group card p-8 text-left hover:border-brand-400 hover:shadow-lg transition-all border-2 border-transparent focus:outline-none focus:border-brand-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-5 group-hover:bg-brand-600 transition-colors">
                <Briefcase size={26} className="text-brand-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">I'm a Skill Provider</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                I lost my job or need extra income. I want to offer my skills and earn money.
              </p>
              <div className="flex items-center gap-2 text-brand-600 font-semibold text-sm">
                Get started <ChevronRight size={16} />
              </div>
            </button>

            {/* Seeker */}
            <button
              onClick={() => setRole('seeker')}
              id="role-seeker"
              className="group card p-8 text-left hover:border-accent-400 hover:shadow-lg transition-all border-2 border-transparent focus:outline-none focus:border-accent-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent-100 flex items-center justify-center mb-5 group-hover:bg-accent-600 transition-colors">
                <Heart size={26} className="text-accent-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">I'm a Skill Seeker</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                I need help and genuine human connection. I want to find real people nearby.
              </p>
              <div className="flex items-center gap-2 text-accent-600 font-semibold text-sm">
                Get started <ChevronRight size={16} />
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Full signup form ─────────────────────────────────────────────────────
  const isProvider = role === 'provider'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => setRole(null)}
            className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 mx-auto"
          >
            ← Change role
          </button>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
            isProvider ? 'bg-brand-100 text-brand-700' : 'bg-accent-100 text-accent-700'
          }`}>
            {isProvider ? <Briefcase size={14} /> : <Heart size={14} />}
            Signing up as a {isProvider ? 'Skill Provider' : 'Skill Seeker'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {/* ── Photo upload ────────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="group relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition-colors"
              id="photo-upload-btn"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera size={28} className="text-gray-400 group-hover:text-gray-500" />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={22} className="text-white" />
              </div>
            </button>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <p className="text-xs text-gray-400">Click to upload photo (optional)</p>
          </div>

          {/* ── Basic fields ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full_name" className="label">
                <User size={13} className="inline mr-1.5" />Full Name
              </label>
              <input id="full_name" name="full_name" type="text" required className="input" placeholder="Jane Smith" />
            </div>
            <div>
              <label htmlFor="city" className="label">
                <MapPin size={13} className="inline mr-1.5" />City
              </label>
              <input id="city" name="city" type="text" required className="input" placeholder="Austin, TX" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="label">
              <Mail size={13} className="inline mr-1.5" />Email Address
            </label>
            <input id="email" name="email" type="email" required className="input" placeholder="jane@example.com" />
          </div>

          <div>
            <label htmlFor="password" className="label">
              <Lock size={13} className="inline mr-1.5" />Password
            </label>
            <input id="password" name="password" type="password" required minLength={8} className="input" placeholder="Min 8 characters" />
          </div>

          <div>
            <label htmlFor="phone" className="label">
              <Phone size={13} className="inline mr-1.5" />Phone Number <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input id="phone" name="phone" type="tel" className="input" placeholder="+1 (555) 000-0000" />
          </div>

          {/* ── Provider fields ────────────────────────────────────── */}
          {isProvider && (
            <>
              {/* Skills */}
              <div>
                <label className="label">
                  <Briefcase size={13} className="inline mr-1.5" />Your Skills (add up to 10)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill) => (
                    <span key={skill} className="badge-blue flex items-center gap-1 pr-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 ml-1">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
                    className="input"
                    placeholder="Type a skill and press Enter"
                    id="skill-input"
                  />
                  <button type="button" onClick={() => addSkill(skillInput)} className="btn-secondary px-4 py-2 flex-shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hourly rate */}
              <div>
                <label htmlFor="hourly_rate" className="label">Hourly Rate (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                  <input
                    id="hourly_rate"
                    type="number"
                    min={5}
                    max={500}
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="input pl-8"
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="label">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input resize-none"
                  placeholder="Tell people about yourself and your skills..."
                />
              </div>
            </>
          )}

          {/* ── Seeker field ─────────────────────────────────────────── */}
          {!isProvider && (
            <div>
              <label htmlFor="help_needed" className="label">What kind of help are you looking for?</label>
              <textarea
                id="help_needed"
                rows={3}
                value={helpNeeded}
                onChange={(e) => setHelpNeeded(e.target.value)}
                className="input resize-none"
                placeholder="e.g. I need help learning to cook, guitar lessons, someone to talk to..."
              />
            </div>
          )}

          {/* ── Terms ───────────────────────────────────────────────── */}
          <p className="text-xs text-gray-400">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
            All meetups must be in public places.
          </p>

          {/* ── Submit ──────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-base"
            id="signup-submit"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Creating account...</>
            ) : (
              <>Create Account <ArrowRight size={18} /></>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

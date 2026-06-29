'use client'

/**
 * app/dashboard/settings/page.tsx — Profile & Skills Settings
 *
 * Rich redesign: dark header banner, tabbed sidebar, glass-style cards.
 * Works for both Provider (profile + skills) and Seeker (profile only).
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Mail, Phone, MapPin, Camera, Briefcase,
  DollarSign, Loader2, ArrowLeft, Save, Plus, Trash2,
  Edit2, Shield, Star, CheckCircle, BadgeCheck, Sparkles,
  Zap, ExternalLink, ShieldCheck, Calendar, Image, CalendarCheck, Copy, Check as CheckIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@/lib/supabase'
import type { UserProfile, Skill } from '@/types'
import AvailabilitySchedule from '@/components/AvailabilitySchedule'
import PortfolioUpload from '@/components/PortfolioUpload'

const SKILL_SUGGESTIONS = [
  'Cooking', 'Guitar', 'Piano', 'Drawing', 'Tutoring', 'Gardening',
  'Yoga', 'Photography', 'Woodworking', 'Language Teaching', 'Coding',
  'Pet Care', 'Fitness Training', 'Painting', 'Baking', 'Home Repair', 'Chess',
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const photoRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)

  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [helpNeeded, setHelpNeeded] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillRate, setNewSkillRate] = useState('')
  const [newSkillDesc, setNewSkillDesc] = useState('')
  const [addingSkill, setAddingSkill] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)
  const [editingRate, setEditingRate] = useState('')
  const [savingSkillId, setSavingSkillId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'pro' | 'security' | 'availability' | 'portfolio' | 'calendar'>('profile')
  const [verifying, setVerifying] = useState(false)
  const [upgradingPro, setUpgradingPro] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [bgCheckStatus, setBgCheckStatus] = useState<string>('not_started')
  const [bgCheckLoading, setBgCheckLoading] = useState(false)

  // Calendar feed state
  const [feedUrl, setFeedUrl] = useState<string | null>(null)
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedCopied, setFeedCopied] = useState(false)

  // 2FA state
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaStep, setMfaStep] = useState<'idle' | 'enroll' | 'verify' | 'done'>('idle')

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user: auth } } = await supabase.auth.getUser()
        if (!auth) { router.push('/login'); return }

        const { data: profile, error } = await supabase
          .from('users').select('*').eq('id', auth.id).single()
        if (error) throw error

        setUser(profile)
        setFullName(profile.full_name || '')
        setCity(profile.city || '')
        setPhone(profile.phone || '')
        setBio(profile.bio || '')
        setHelpNeeded(profile.help_needed || '')
        setPhotoUrl(profile.photo_url)
        setIsPro(!!(profile as unknown as { is_pro?: boolean }).is_pro)
        // Handle tab param from URL
        const sp = new URLSearchParams(window.location.search)
        if (sp.get('tab') === 'calendar') setActiveTab('calendar')

        if (profile.role === 'provider') {
          const { data: sk } = await supabase
            .from('skills').select('*').eq('user_id', auth.id).order('created_at')
          setSkills(sk || [])
        }

        // Load background check status
        const bgRes = await fetch('/api/background-check').catch(() => null)
        if (bgRes?.ok) {
          const bgJson = await bgRes.json()
          setBgCheckStatus(bgJson.data?.status ?? 'not_started')
        }

        // Check existing MFA factors
        const { data: mfaData } = await supabase.auth.mfa.listFactors()
        const totpFactor = mfaData?.totp?.[0]
        if (totpFactor && totpFactor.status === 'verified') {
          setMfaEnabled(true)
          setMfaFactorId(totpFactor.id)
          setMfaStep('done')
        }
      } catch (err: unknown) {
        toast.error('Failed to load profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase, router])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSavingProfile(true)
    try {
      let url = photoUrl
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${user.id}/avatar_${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('avatars').upload(path, photoFile, { upsert: true })
        if (upErr) throw upErr
        url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      }
      const { error } = await supabase.from('users').update({
        full_name: fullName,
        city,
        phone: phone || null,
        photo_url: url,
        bio: user.role === 'provider' ? bio || null : null,
        help_needed: user.role === 'seeker' ? helpNeeded || null : null,
      }).eq('id', user.id)
      if (error) throw error
      setPhotoUrl(url); setPhotoFile(null); setPhotoPreview(null)
      toast.success('✅ Profile saved!')
      router.refresh()
    } catch (err: unknown) {
      toast.error('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newSkillName.trim() || !newSkillRate) return
    setAddingSkill(true)
    try {
      const rate = parseFloat(newSkillRate)
      if (isNaN(rate) || rate < 5) throw new Error('Minimum rate is $5/hr')
      const { data, error } = await supabase.from('skills').insert({
        user_id: user.id, skill_name: newSkillName.trim(),
        hourly_rate: rate, description: newSkillDesc.trim() || null,
      }).select().single()
      if (error) throw error
      setSkills(p => [...p, data])
      setNewSkillName(''); setNewSkillRate(''); setNewSkillDesc('')
      toast.success('Skill added!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add skill')
    } finally { setAddingSkill(false) }
  }

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Delete this skill?')) return
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id)
      if (error) throw error
      setSkills(p => p.filter(s => s.id !== id))
      toast.success('Skill removed')
    } catch (err: unknown) {
      toast.error('Failed to delete')
    }
  }

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const res = await fetch('/api/verify', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      window.location.href = json.data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed')
      setVerifying(false)
    }
  }

  const handleUpgradePro = async () => {
    setUpgradingPro(true)
    try {
      const res = await fetch('/api/subscription', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      window.location.href = json.data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upgrade failed')
      setUpgradingPro(false)
    }
  }

  const handleUpdateRate = async (id: string) => {
    const rate = parseFloat(editingRate)
    if (isNaN(rate) || rate < 5) { toast.error('Min rate is $5/hr'); return }
    setSavingSkillId(id)
    try {
      const { error } = await supabase.from('skills')
        .update({ hourly_rate: rate }).eq('id', id)
      if (error) throw error
      setSkills(p => p.map(s => s.id === id ? { ...s, hourly_rate: rate } : s))
      setEditingSkillId(null)
      toast.success('Rate updated!')
    } catch (err: unknown) {
      toast.error('Failed to update rate')
    } finally { setSavingSkillId(null) }
  }

  // ── Background check handler ──────────────────────────────────────────────
  const handleStartBgCheck = async () => {
    setBgCheckLoading(true)
    try {
      const res = await fetch('/api/background-check', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setBgCheckStatus('pending')
      toast.success(json.data?.message ?? 'Background check initiated!')
      if (json.data?.invitationUrl) window.open(json.data.invitationUrl, '_blank')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start background check')
    } finally {
      setBgCheckLoading(false)
    }
  }

  // ── 2FA handlers ──────────────────────────────────────────────────────────
  const handleEnroll2FA = async () => {
    setMfaLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'GetHumane' })
      if (error) throw error
      setMfaFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setTotpSecret(data.totp.secret)
      setMfaStep('enroll')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start 2FA setup')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!mfaFactorId || totpCode.length < 6) return
    setMfaLoading(true)
    try {
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId })
      if (challengeErr) throw challengeErr
      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: totpCode,
      })
      if (verifyErr) throw verifyErr
      setMfaEnabled(true)
      setMfaStep('done')
      setQrCode(null)
      setTotpSecret(null)
      setTotpCode('')
      toast.success('Two-factor authentication enabled!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code — try again')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!mfaFactorId || !confirm('Disable two-factor authentication? Your account will be less secure.')) return
    setMfaLoading(true)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId })
      if (error) throw error
      setMfaEnabled(false)
      setMfaFactorId(null)
      setMfaStep('idle')
      toast.success('Two-factor authentication disabled.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleLoadFeed = async () => {
    if (feedUrl) return
    setFeedLoading(true)
    try {
      const res = await fetch('/api/calendar/token')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setFeedUrl(json.data.feedUrl)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load calendar link')
    } finally { setFeedLoading(false) }
  }

  const handleCopyFeed = async () => {
    if (!feedUrl) return
    await navigator.clipboard.writeText(feedUrl)
    setFeedCopied(true)
    setTimeout(() => setFeedCopied(false), 2000)
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="animate-spin text-brand-600 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Loading your profile…</p>
      </div>
    </div>
  )
  if (!user) return null

  const isProvider = user.role === 'provider'
  const displayPhoto = photoPreview || photoUrl

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Clickable avatar */}
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => photoRef.current?.click()}>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-100 flex items-center justify-center font-bold text-brand-700">
                {displayPhoto
                  ? <img src={displayPhoto} alt={user.full_name} className="w-full h-full object-cover" />
                  : user.full_name?.[0]?.toUpperCase()
                }
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={14} className="text-white" />
              </div>
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-gray-900">{fullName || user.full_name}</h1>
                {user.is_verified && <BadgeCheck size={15} className="text-brand-500" />}
              </div>
              <p className="text-xs text-gray-400">
                {isProvider ? 'Skill Provider' : 'Skill Seeker'}
                {city ? ` · ${city}` : ''}
              </p>
            </div>
          </div>
          {photoPreview && (
            <div className="flex items-center gap-2 text-sm text-brand-700 font-semibold bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-xl">
              <Camera size={14} />
              New photo — save to apply
              <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                className="text-brand-500 hover:text-brand-800 ml-1 font-medium">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Nav tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile'
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <User size={16} />
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'security'
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Shield size={16} />
                Security
                {mfaEnabled && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">2FA ON</span>}
              </button>
              {isProvider && (
                <>
                  <button
                    onClick={() => setActiveTab('skills')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'skills'
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Briefcase size={16} />
                    My Skills
                    {skills.length > 0 && (
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'skills' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                        }`}>{skills.length}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('availability')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'availability'
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Calendar size={16} />
                    Availability
                  </button>
                  <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'portfolio'
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Image size={16} />
                    Portfolio
                  </button>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'calendar'
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <CalendarCheck size={16} />
                    Calendar Sync
                  </button>
                  <button
                    onClick={() => setActiveTab('pro')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pro'
                        ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Zap size={16} />
                    Provider Pro
                    {isPro
                      ? <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">ACTIVE</span>
                      : <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">UPGRADE</span>
                    }
                  </button>
                </>
              )}
            </div>

            {/* Profile card preview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Profile Preview</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-100 flex items-center justify-center text-brand-700 font-bold flex-shrink-0">
                  {displayPhoto
                    ? <img src={displayPhoto} alt="" className="w-full h-full object-cover" />
                    : user.full_name?.[0]?.toUpperCase()
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{fullName || 'Your Name'}</p>
                  <p className="text-xs text-gray-400">{city || 'Your City'}</p>
                </div>
              </div>
              {isProvider && skills.length > 0 && (
                <div className="space-y-1.5">
                  {skills.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 truncate">{s.skill_name}</span>
                      <span className="text-xs font-bold text-brand-600">${s.hourly_rate}/hr</span>
                    </div>
                  ))}
                  {skills.length > 3 && (
                    <p className="text-xs text-gray-400">+{skills.length - 3} more skills</p>
                  )}
                </div>
              )}
            </div>

            {/* Safety info box */}
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-emerald-600" />
                <p className="text-sm font-bold text-emerald-800">Safety Promise</p>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                All sessions take place at public locations only. Your personal address is never shared.
              </p>
            </div>
          </div>

          {/* ── Main content ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">

            {/* ── TAB: Profile ─────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile}>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                      <User size={17} className="text-brand-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Profile Information</h2>
                      <p className="text-xs text-gray-400 mt-0.5">This is how people see you on GetHumane.</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="full_name" className="label">Full Name</label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input id="full_name" type="text" required value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="input pl-10" placeholder="Jane Smith" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="city" className="label">City</label>
                        <div className="relative">
                          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input id="city" type="text" required value={city}
                            onChange={e => setCity(e.target.value)}
                            className="input pl-10" placeholder="Austin, TX" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="label">Email Address</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input id="email" type="email" value={user.email} disabled
                          className="input pl-10 bg-gray-50 text-gray-400 cursor-not-allowed" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support if needed.</p>
                    </div>

                    <div>
                      <label htmlFor="phone" className="label">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input id="phone" type="tel" value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="input pl-10" placeholder="+1 (555) 000-0000" />
                      </div>
                    </div>

                    {isProvider ? (
                      <div>
                        <label htmlFor="bio" className="label">Bio / About You</label>
                        <textarea id="bio" rows={5} value={bio}
                          onChange={e => setBio(e.target.value)}
                          className="input resize-none"
                          placeholder="Share your experience, what motivates you, and what makes you great at what you do. Seekers read this before booking you." />
                        <p className="text-xs text-gray-400 mt-1">{bio.length}/500 characters</p>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="help" className="label">What kind of help are you looking for?</label>
                        <textarea id="help" rows={5} value={helpNeeded}
                          onChange={e => setHelpNeeded(e.target.value)}
                          className="input resize-none"
                          placeholder="Describe what you need. This helps providers understand how they can assist you best." />
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button type="submit" disabled={savingProfile} className="btn-primary gap-2">
                      {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {savingProfile ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ── TAB: Skills ──────────────────────────────────────────────── */}
            {isProvider && activeTab === 'skills' && (
              <div className="space-y-5">
                {/* Existing skills */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                        <Briefcase size={17} className="text-brand-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">Listed Skills</h2>
                        <p className="text-xs text-gray-400 mt-0.5">These appear on your public profile. Edit rates anytime.</p>
                      </div>
                    </div>
                    <span className="badge-blue">{skills.length} skill{skills.length !== 1 ? 's' : ''}</span>
                  </div>

                  {!skills.length ? (
                    <div className="py-14 text-center px-6">
                      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={24} className="text-brand-300" />
                      </div>
                      <h3 className="font-semibold text-gray-700 mb-1">No skills listed yet</h3>
                      <p className="text-sm text-gray-400 max-w-xs mx-auto">
                        Add at least one skill below to start appearing in search results and get bookings.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {skills.map((skill) => (
                        <div key={skill.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900">{skill.skill_name}</h3>
                              <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                            </div>
                            {skill.description ? (
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{skill.description}</p>
                            ) : (
                              <p className="text-xs text-gray-300 italic mt-0.5">No description — add one to attract more bookings</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            {editingSkillId === skill.id ? (
                              <div className="flex items-center gap-2">
                                <div className="relative w-28">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                                  <input type="number" min={5} value={editingRate}
                                    onChange={e => setEditingRate(e.target.value)}
                                    className="input py-2 pl-7 pr-2 text-sm w-full" />
                                </div>
                                <span className="text-xs text-gray-400">/hr</span>
                                <button onClick={() => handleUpdateRate(skill.id)}
                                  disabled={savingSkillId === skill.id}
                                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors">
                                  {savingSkillId === skill.id
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Save size={14} />}
                                </button>
                                <button onClick={() => setEditingSkillId(null)}
                                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="font-bold text-brand-600 text-lg">${skill.hourly_rate}</span>
                                  <span className="text-xs text-gray-400">/hr</span>
                                </div>
                                <button onClick={() => { setEditingSkillId(skill.id); setEditingRate(skill.hourly_rate.toString()) }}
                                  className="p-2 hover:bg-brand-50 text-gray-400 hover:text-brand-600 rounded-lg transition-colors"
                                  title="Edit rate">
                                  <Edit2 size={15} />
                                </button>
                                <button onClick={() => handleDeleteSkill(skill.id)}
                                  className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                  title="Remove skill">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add skill */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Plus size={17} className="text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Add a New Skill</h2>
                      <p className="text-xs text-gray-400 mt-0.5">More skills = more visibility in search results.</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddSkill} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="skill_name" className="label">Skill Name</label>
                        <input id="skill_name" type="text" required value={newSkillName}
                          onChange={e => setNewSkillName(e.target.value)}
                          className="input" placeholder="e.g. Guitar Lessons" />
                      </div>
                      <div>
                        <label htmlFor="hourly_rate" className="label">Hourly Rate (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                          <input id="hourly_rate" type="number" min={5} required value={newSkillRate}
                            onChange={e => setNewSkillRate(e.target.value)}
                            className="input pl-8" placeholder="35" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="skill_desc" className="label">
                        Description <span className="text-gray-400 font-normal">(optional but recommended)</span>
                      </label>
                      <textarea id="skill_desc" rows={3} value={newSkillDesc}
                        onChange={e => setNewSkillDesc(e.target.value)}
                        className="input resize-none"
                        placeholder="Describe what you offer — experience level, what seekers will learn, what to bring, etc." />
                    </div>

                    {/* Quick suggestions */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">Quick add:</p>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_SUGGESTIONS
                          .filter(s => !skills.some(sk => sk.skill_name.toLowerCase() === s.toLowerCase()))
                          .slice(0, 10)
                          .map(s => (
                            <button key={s} type="button" onClick={() => setNewSkillName(s)}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${newSkillName === s
                                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                                  : 'border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600'
                                }`}>
                              {s}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button type="submit"
                        disabled={addingSkill || !newSkillName.trim() || !newSkillRate}
                        className="btn-primary gap-2">
                        {addingSkill ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Add to Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── TAB: Security (2FA) ──────────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                      <Shield size={17} className="text-brand-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Two-Factor Authentication</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security using an authenticator app.</p>
                    </div>
                    {mfaEnabled && <span className="ml-auto badge-green">Enabled</span>}
                  </div>

                  <div className="px-6 py-6">
                    {mfaStep === 'done' && mfaEnabled && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-emerald-800 text-sm">2FA is active on your account</p>
                            <p className="text-xs text-emerald-600 mt-1">
                              Every sign-in requires a code from your authenticator app (Google Authenticator, Authy, etc.).
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleDisable2FA}
                          disabled={mfaLoading}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                        >
                          {mfaLoading ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                          Disable Two-Factor Authentication
                        </button>
                      </div>
                    )}

                    {mfaStep === 'idle' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { step: '1', title: 'Install app', desc: 'Download Google Authenticator or Authy' },
                            { step: '2', title: 'Scan QR code', desc: 'Scan the code we generate for you' },
                            { step: '3', title: 'Enter code', desc: 'Confirm the 6-digit code from the app' },
                          ].map(s => (
                            <div key={s.step} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mb-2">{s.step}</div>
                              <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleEnroll2FA}
                          disabled={mfaLoading}
                          className="btn-primary gap-2"
                        >
                          {mfaLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                          Set Up Two-Factor Authentication
                        </button>
                      </div>
                    )}

                    {mfaStep === 'enroll' && qrCode && (
                      <div className="space-y-5">
                        <p className="text-sm text-gray-600">
                          Scan this QR code with your authenticator app, then enter the 6-digit code below.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                          <div className="bg-white border border-gray-200 p-3 rounded-xl flex-shrink-0">
                            <img src={qrCode} alt="QR Code for 2FA" className="w-40 h-40" />
                          </div>
                          <div className="flex-1 space-y-3">
                            {totpSecret && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Manual entry key:</p>
                                <code className="text-xs bg-gray-100 px-3 py-2 rounded-lg font-mono break-all block text-gray-700">{totpSecret}</code>
                              </div>
                            )}
                            <div>
                              <label className="label">Enter 6-digit code from your app</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={totpCode}
                                onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                className="input tracking-widest text-lg font-mono text-center max-w-xs"
                                placeholder="000000"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={handleVerify2FA}
                                disabled={mfaLoading || totpCode.length < 6}
                                className="btn-primary gap-2"
                              >
                                {mfaLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                Verify & Enable
                              </button>
                              <button
                                onClick={() => { setMfaStep('idle'); setQrCode(null); setTotpCode('') }}
                                className="btn-secondary gap-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Availability ─────────────────────────────────────────── */}
            {isProvider && activeTab === 'availability' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Calendar size={17} className="text-brand-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Availability Schedule</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Set which days and hours seekers can book you.</p>
                  </div>
                </div>
                <div className="p-6">
                  <AvailabilitySchedule userId={user.id} />
                </div>
              </div>
            )}

            {/* ── TAB: Portfolio ───────────────────────────────────────────── */}
            {isProvider && activeTab === 'portfolio' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Image size={17} className="text-brand-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Portfolio Photos</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Show seekers examples of your work. Upload up to 12 photos.</p>
                  </div>
                </div>
                <div className="p-6">
                  <PortfolioUpload userId={user.id} />
                </div>
              </div>
            )}

            {/* ── TAB: Calendar Sync ───────────────────────────────────────── */}
            {isProvider && activeTab === 'calendar' && (
              <div className="space-y-5">
                {/* Main card */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                      <CalendarCheck size={17} className="text-brand-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Calendar Sync</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Subscribe to your bookings in any calendar app — free, no account needed.</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* How it works */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { step: '1', title: 'Get your link', desc: 'Click below to reveal your personal calendar feed URL' },
                        { step: '2', title: 'Subscribe', desc: 'Paste the link into Google Calendar, Apple Calendar, or Outlook' },
                        { step: '3', title: 'Auto-updates', desc: 'New confirmed bookings appear in your calendar automatically' },
                      ].map(s => (
                        <div key={s.step} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mb-2">{s.step}</div>
                          <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Feed URL */}
                    {!feedUrl ? (
                      <button
                        onClick={handleLoadFeed}
                        disabled={feedLoading}
                        className="btn-primary gap-2"
                      >
                        {feedLoading ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
                        {feedLoading ? 'Generating link…' : 'Show My Calendar Link'}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500">Your personal calendar feed URL</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={feedUrl}
                            className="input flex-1 text-xs font-mono bg-gray-50 text-gray-600 cursor-default"
                            onFocus={e => e.target.select()}
                          />
                          <button
                            onClick={handleCopyFeed}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${feedCopied
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-brand-600 text-white hover:bg-brand-700'
                              }`}
                          >
                            {feedCopied ? <CheckIcon size={15} /> : <Copy size={15} />}
                            {feedCopied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">Keep this link private — anyone with it can see your booking schedule.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions per app */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">How to subscribe in your calendar app</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      {
                        app: 'Google Calendar',
                        emoji: '📅',
                        steps: 'Open Google Calendar → click + next to "Other calendars" → "From URL" → paste your link → "Add calendar"',
                      },
                      {
                        app: 'Apple Calendar (iPhone / Mac)',
                        emoji: '🍎',
                        steps: 'Open Calendar app → File → New Calendar Subscription (Mac) or tap Calendars → Add Calendar → Add Subscribed Calendar (iPhone) → paste your link',
                      },
                      {
                        app: 'Outlook',
                        emoji: '📧',
                        steps: 'Open Outlook → Calendar → Add calendar → Subscribe from web → paste your link → Import',
                      },
                    ].map(item => (
                      <div key={item.app} className="px-6 py-4 flex gap-3">
                        <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.app}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.steps}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 flex gap-3">
                  <Calendar size={18} className="text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-brand-800">What&apos;s included in the feed?</p>
                    <p className="text-xs text-brand-700 mt-1 leading-relaxed">
                      All your confirmed and completed bookings from the past 7 days onwards. Sessions are shown as 1-hour events with the seeker&apos;s name, location, and price. The feed refreshes automatically when your calendar app syncs (usually every few hours).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Provider Pro ─────────────────────────────────────────── */}
            {isProvider && activeTab === 'pro' && (
              <div className="space-y-5">

                {/* Current status */}
                {isPro ? (
                  <div className="bg-gradient-to-br from-brand-600 to-accent-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Zap size={20} className="fill-white text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">Provider Pro — Active</h2>
                        <p className="text-white/70 text-sm">Your subscription is active. All Pro features are unlocked.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {['Featured in browse', 'Analytics dashboard', 'Priority support', 'Pro badge'].map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-white/90">
                          <CheckCircle size={14} className="text-white flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-6 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap size={18} className="text-accent-400 fill-accent-400" />
                        <h2 className="font-bold text-xl">Provider Pro</h2>
                        <span className="ml-2 text-xs font-bold px-2.5 py-0.5 bg-accent-500 text-white rounded-full">14-day free trial</span>
                      </div>
                      <p className="text-white/60 text-sm">Get more bookings. Earn more. Stand out from the crowd.</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">$19</span>
                        <span className="text-white/50">/month</span>
                      </div>
                    </div>
                    <div className="px-6 py-5 space-y-3">
                      {[
                        { icon: <Star size={15} className="text-yellow-500" />, label: 'Featured listing — appear first in browse results' },
                        { icon: <TrendingUp size={15} className="text-brand-500" />, label: 'Analytics — earnings, views, conversion rate' },
                        { icon: <BadgeCheck size={15} className="text-brand-500" />, label: 'Pro badge on your profile and in search' },
                        { icon: <Shield size={15} className="text-emerald-500" />, label: 'Priority safety support response' },
                        { icon: <Zap size={15} className="text-accent-500" />, label: 'Early access to new features' },
                      ].map((f) => (
                        <div key={f.label} className="flex items-center gap-3 text-sm text-gray-700">
                          {f.icon}
                          {f.label}
                        </div>
                      ))}
                      <button
                        onClick={handleUpgradePro}
                        disabled={upgradingPro}
                        className="w-full mt-4 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
                      >
                        {upgradingPro ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="fill-white" />}
                        {upgradingPro ? 'Redirecting…' : 'Start Free Trial — $19/mo after'}
                      </button>
                      <p className="text-center text-xs text-gray-400">Cancel anytime. No lock-in.</p>
                    </div>
                  </div>
                )}

                {/* ID Verification card */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <ShieldCheck size={17} className="text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Identity Verification</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Verified providers get 3× more bookings.</p>
                    </div>
                    {user.is_verified && <span className="ml-auto badge-green">Verified</span>}
                  </div>
                  <div className="px-6 py-5">
                    {user.is_verified ? (
                      <div className="flex items-center gap-3">
                        <BadgeCheck size={20} className="text-brand-500" />
                        <p className="text-sm text-gray-700 font-medium">Your identity is verified. Seekers can trust you.</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-4">
                          Get a verified badge by completing a 60-second selfie + ID check powered by Stripe Identity. Your data is never stored on our servers.
                        </p>
                        <button
                          onClick={handleVerify}
                          disabled={verifying}
                          className="btn-primary gap-2"
                        >
                          {verifying ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                          {verifying ? 'Opening verification…' : 'Verify My Identity'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {/* Background Check card */}
                {isProvider && (
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                        <Star size={17} className="text-violet-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">Background Check</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Powered by Checkr — builds trust with seekers.</p>
                      </div>
                      {bgCheckStatus === 'clear' && <span className="ml-auto badge-green">Clear</span>}
                      {bgCheckStatus === 'pending' && <span className="ml-auto badge-orange">Pending</span>}
                    </div>
                    <div className="px-6 py-5">
                      {bgCheckStatus === 'clear' ? (
                        <div className="flex items-center gap-3">
                          <CheckCircle size={20} className="text-emerald-500" />
                          <p className="text-sm text-gray-700 font-medium">Your background check came back clear. Seekers see a verified badge.</p>
                        </div>
                      ) : bgCheckStatus === 'pending' ? (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                          <Loader2 size={18} className="text-amber-600 animate-spin" />
                          <div>
                            <p className="font-semibold text-amber-800 text-sm">Background check in progress</p>
                            <p className="text-xs text-amber-600 mt-0.5">Results typically take 1-3 business days. We'll email you when it's complete.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mb-4">
                            A verified background check badge increases booking rates by up to 40%. Takes 1-3 business days.
                          </p>
                          <div className="grid grid-cols-3 gap-3 mb-5">
                            {['Criminal records', 'Sex offender registry', 'Identity confirmation'].map(f => (
                              <div key={f} className="p-3 bg-gray-50 rounded-xl text-center">
                                <CheckCircle size={16} className="text-brand-500 mx-auto mb-1" />
                                <p className="text-xs text-gray-600">{f}</p>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={handleStartBgCheck}
                            disabled={bgCheckLoading}
                            className="btn-primary gap-2"
                          >
                            {bgCheckLoading ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
                            {bgCheckLoading ? 'Starting…' : 'Start Background Check'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// needed by Pro tab
function TrendingUp({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

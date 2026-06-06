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
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@/lib/supabase'
import type { UserProfile, Skill } from '@/types'

const SKILL_SUGGESTIONS = [
  'Cooking', 'Guitar', 'Piano', 'Drawing', 'Tutoring', 'Gardening',
  'Yoga', 'Photography', 'Woodworking', 'Language Teaching', 'Coding',
  'Pet Care', 'Fitness Training', 'Painting', 'Baking', 'Home Repair', 'Chess',
]

export default function SettingsPage() {
  const router   = useRouter()
  const supabase = createBrowserClient()
  const photoRef = useRef<HTMLInputElement>(null)

  const [loading,       setLoading]       = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [user,          setUser]          = useState<UserProfile | null>(null)

  const [fullName,    setFullName]    = useState('')
  const [city,        setCity]        = useState('')
  const [phone,       setPhone]       = useState('')
  const [bio,         setBio]         = useState('')
  const [helpNeeded,  setHelpNeeded]  = useState('')
  const [photoUrl,    setPhotoUrl]    = useState<string | null>(null)
  const [photoFile,   setPhotoFile]   = useState<File | null>(null)
  const [photoPreview,setPhotoPreview]= useState<string | null>(null)

  const [skills,         setSkills]         = useState<Skill[]>([])
  const [newSkillName,   setNewSkillName]   = useState('')
  const [newSkillRate,   setNewSkillRate]   = useState('')
  const [newSkillDesc,   setNewSkillDesc]   = useState('')
  const [addingSkill,    setAddingSkill]    = useState(false)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)
  const [editingRate,    setEditingRate]    = useState('')
  const [savingSkillId,  setSavingSkillId]  = useState<string | null>(null)
  const [activeTab,      setActiveTab]      = useState<'profile' | 'skills'>('profile')

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

        if (profile.role === 'provider') {
          const { data: sk } = await supabase
            .from('skills').select('*').eq('user_id', auth.id).order('created_at')
          setSkills(sk || [])
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
        full_name:   fullName,
        city,
        phone:       phone || null,
        photo_url:   url,
        bio:         user.role === 'provider' ? bio || null : null,
        help_needed: user.role === 'seeker'   ? helpNeeded || null : null,
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
    <div className="min-h-screen bg-gray-50">
      {/* ── Dark Header Banner ───────────────────────────────────────────────── */}
      <div className="bg-gray-950 pt-24 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-800 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-accent-800 rounded-full blur-3xl opacity-10" />
        <div className="container-app relative z-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors mb-5"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative group cursor-pointer" onClick={() => photoRef.current?.click()}>
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 bg-brand-700 flex items-center justify-center text-3xl font-black text-white">
                  {displayPhoto
                    ? <img src={displayPhoto} alt={user.full_name} className="w-full h-full object-cover" />
                    : user.full_name?.[0]?.toUpperCase()
                  }
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-600 border-2 border-gray-950 flex items-center justify-center">
                  <Camera size={12} className="text-white" />
                </div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-white">{fullName || user.full_name}</h1>
                  {user.is_verified && <BadgeCheck size={18} className="text-brand-400" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isProvider ? 'bg-brand-700 text-brand-200' : 'bg-accent-800 text-accent-300'}`}>
                    {isProvider ? 'Skill Provider' : 'Skill Seeker'}
                  </span>
                  {city && (
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <MapPin size={11} /> {city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats for providers */}
            {isProvider && (
              <div className="flex gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-xl font-black text-white">{skills.length}</p>
                  <p className="text-xs text-white/40">Skills Listed</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-xl font-black text-emerald-400">
                    {skills.length ? `$${Math.min(...skills.map(s => s.hourly_rate))}+` : '—'}
                  </p>
                  <p className="text-xs text-white/40">Starting Rate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Nav tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User size={16} />
                Profile Info
              </button>
              {isProvider && (
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'skills'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase size={16} />
                  My Skills
                  {skills.length > 0 && (
                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'skills' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                    }`}>{skills.length}</span>
                  )}
                </button>
              )}
            </div>

            {/* Profile card preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Profile Preview</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-100 flex items-center justify-center text-brand-700 font-black flex-shrink-0">
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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                    {/* Photo changed alert */}
                    {photoPreview && (
                      <div className="flex items-center justify-between gap-4 p-4 bg-brand-50 border border-brand-100 rounded-xl">
                        <div className="flex items-center gap-2 text-brand-700 text-sm font-semibold">
                          <Camera size={15} />
                          New photo selected — save to upload
                        </div>
                        <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                          className="text-xs text-brand-600 hover:underline font-medium">
                          Cancel
                        </button>
                      </div>
                    )}

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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                                  <span className="font-black text-brand-600 text-lg">${skill.hourly_rate}</span>
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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                                newSkillName === s
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
          </div>
        </div>
      </div>
    </div>
  )
}

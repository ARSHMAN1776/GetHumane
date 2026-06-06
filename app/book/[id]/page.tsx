/**
 * app/book/[id]/page.tsx — Booking Page (Server Component)
 *
 * Shows provider summary + BookingForm client component.
 * Protected: requires authentication (middleware handles redirect).
 */

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, BadgeCheck, Shield } from 'lucide-react'
import { createServerClient, getCurrentUser } from '@/lib/supabase'
import BookingForm from '@/components/BookingForm'
import StarRating from '@/components/StarRating'
import type { Metadata } from 'next'
import type { ProviderProfile } from '@/types'

// Force dynamic — uses Supabase server auth
export const dynamic = 'force-dynamic'

// Next.js 16: params is a Promise
interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerClient()
  const { data } = await supabase.from('users').select('full_name').eq('id', id).single()
  return { title: data?.full_name ? `Book ${data.full_name}` : 'Book a Session' }
}

export default async function BookingPage({ params }: Props) {
  const { id }       = await params
  const currentUser  = await getCurrentUser()
  const supabase     = await createServerClient()

  // Auth guard — middleware already handles this, but belt-and-suspenders
  if (!currentUser) redirect(`/login?redirectTo=/book/${id}`)

  // Can't book yourself
  if (currentUser.id === id) redirect('/dashboard')

  // Fetch provider
  const { data: provider, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('role', 'provider')
    .single()

  if (error || !provider) notFound()

  // Fetch provider skills
  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', id)

  // Fetch avg rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', id)

  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  // Build full ProviderProfile for the form
  const providerProfile: ProviderProfile = {
    id:           provider.id,
    full_name:    provider.full_name,
    photo_url:    provider.photo_url,
    city:         provider.city,
    is_verified:  provider.is_verified,
    bio:          provider.bio,
    phone:        provider.phone,
    skills:       skills ?? [],
    avg_rating:   avgRating,
    review_count: reviews?.length ?? 0,
    reviews:      [],
  }

  return (
    <div className="container-app py-10">
      <div className="max-w-4xl mx-auto">

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <Link
          href={`/provider/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {provider.full_name?.split(' ')[0]}&apos;s profile
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Provider Summary (left) ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-6">
              {/* Photo */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative flex-shrink-0">
                  {provider.photo_url ? (
                    <img
                      src={provider.photo_url}
                      alt={provider.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-600">
                      {provider.full_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {provider.is_verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center border-2 border-white">
                      <BadgeCheck size={13} className="text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">{provider.full_name}</h2>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={13} />
                    {provider.city}
                  </div>
                  {reviews && reviews.length > 0 && (
                    <StarRating rating={avgRating} size={13} showValue count={reviews.length} />
                  )}
                </div>
              </div>

              {/* Skills summary */}
              {skills && skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills</p>
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{skill.skill_name}</span>
                      <span className="text-sm font-bold text-brand-600">${skill.hourly_rate}/hr</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Safety reminder */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} className="text-emerald-600" />
                <p className="font-semibold text-emerald-800">Safety Reminders</p>
              </div>
              <ul className="space-y-2 text-sm text-emerald-700">
                {[
                  'Always meet in a public place',
                  'Tell someone where you\'re going',
                  'Use the in-app panic button if needed',
                  'Trust your instincts — cancel if uncomfortable',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
              <Link
                href="/safety"
                className="inline-flex items-center gap-1 mt-3 text-xs text-emerald-700 font-semibold hover:underline"
              >
                Read our full safety guide →
              </Link>
            </div>
          </div>

          {/* ── Booking Form (right) ───────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="card p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Request a Session
              </h1>
              <BookingForm provider={providerProfile} seekerId={currentUser.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

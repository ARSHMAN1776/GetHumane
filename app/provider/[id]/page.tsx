/**
 * app/provider/[id]/page.tsx — Provider Profile Page (Server Component)
 *
 * Shows full profile: photo, bio, skills, reviews, availability note,
 * "Book This Person" CTA, public meetup badge, and report button.
 */

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, BadgeCheck, DollarSign, Shield,
  Calendar, ArrowRight, MessageSquare
} from 'lucide-react'
import { createServerClient, getCurrentUser } from '@/lib/supabase'
import StarRating from '@/components/StarRating'
import ReviewCard from '@/components/ReviewCard'
import EmptyState from '@/components/EmptyState'
import ReportButton from '@/components/ReportButton'
import type { Metadata } from 'next'

// Force dynamic — uses Supabase server auth
export const dynamic = 'force-dynamic'

// Next.js 16: params is a Promise
interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerClient()
  const { data } = await supabase.from('users').select('full_name').eq('id', id).single()
  return { title: data?.full_name ? `${data.full_name}'s Profile` : 'Provider Profile' }
}

export default async function ProviderProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const currentUser = await getCurrentUser()

  // Fetch provider profile
  const { data: provider, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('role', 'provider')
    .single()

  if (error || !provider) notFound()

  // Fetch skills
  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', id)

  // Fetch reviews (with reviewer info)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviews_reviewer_id_fkey(id,full_name,photo_url)')
    .eq('reviewee_id', id)
    .order('created_at', { ascending: false })

  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const primarySkill = skills?.[0]

  return (
    <div className="container-app py-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left sidebar: profile card ─────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">

            {/* Profile card */}
            <div className="card p-6 text-center">
              {/* Photo */}
              <div className="relative w-28 h-28 mx-auto mb-4">
                {provider.photo_url ? (
                  <img
                    src={provider.photo_url}
                    alt={provider.full_name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center text-4xl font-black text-brand-600 border-4 border-white shadow-lg">
                    {provider.full_name?.[0]?.toUpperCase()}
                  </div>
                )}
                {provider.is_verified && (
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center border-2 border-white">
                    <BadgeCheck size={16} className="text-white" />
                  </div>
                )}
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-1">{provider.full_name}</h1>

              {provider.is_verified && (
                <div className="badge-blue mx-auto mb-2">
                  <BadgeCheck size={12} />
                  Verified
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500 mb-3">
                <MapPin size={14} />
                {provider.city}
              </div>

              {reviews && reviews.length > 0 && (
                <div className="flex justify-center mb-4">
                  <StarRating rating={avgRating} showValue count={reviews.length} />
                </div>
              )}

              {/* Price */}
              {primarySkill && (
                <div className="flex items-center justify-center gap-1.5 text-xl font-bold text-brand-600 mb-5">
                  <DollarSign size={20} />
                  {primarySkill.hourly_rate}
                  <span className="text-sm font-normal text-gray-400">/hour</span>
                </div>
              )}

              {/* Book CTA */}
              {currentUser && currentUser.id !== id ? (
                <Link
                  href={`/book/${id}`}
                  className="btn-primary w-full py-3 text-base"
                  id="book-this-person-btn"
                >
                  <Calendar size={18} />
                  Book This Person
                </Link>
              ) : !currentUser ? (
                <Link href={`/login?redirectTo=/book/${id}`} className="btn-primary w-full py-3 text-base">
                  Sign In to Book
                </Link>
              ) : null}

              {/* Public meetup badge */}
              <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <Shield size={16} className="text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">Public meetup only</p>
              </div>

              {/* Report button — client component to handle fetch */}
              {currentUser && currentUser.id !== id && (
                <ReportButton reportedUserId={id} />
              )}
            </div>

            {/* Skills list */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Skills Offered</h2>
              {skills?.length ? (
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{skill.skill_name}</p>
                        {skill.description && (
                          <p className="text-xs text-gray-400 line-clamp-1">{skill.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-brand-600 flex-shrink-0">
                        ${skill.hourly_rate}/hr
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No skills listed yet.</p>
              )}
            </div>
          </div>

          {/* ── Main content ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bio */}
            {provider.bio && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare size={18} className="text-brand-500" />
                  About {provider.full_name?.split(' ')[0]}
                </h2>
                <p className="text-gray-600 leading-relaxed">{provider.bio}</p>
              </div>
            )}

            {/* Availability note */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-brand-500" />
                Availability
              </h2>
              <p className="text-gray-600 text-sm">
                {provider.full_name?.split(' ')[0]} accepts booking requests and will confirm
                within 24 hours. Choose your preferred date and time when booking.
              </p>
              {currentUser && currentUser.id !== id && (
                <Link href={`/book/${id}`} className="btn-secondary mt-4 text-sm py-2.5">
                  <Calendar size={16} />
                  Request a Time
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>

            {/* Reviews */}
            <div>
              <h2 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                Reviews
                {reviews && reviews.length > 0 && (
                  <span className="badge-gray">
                    {reviews.length}
                  </span>
                )}
              </h2>

              {!reviews?.length ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No reviews yet"
                  description="Be the first to book and leave a review!"
                />
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

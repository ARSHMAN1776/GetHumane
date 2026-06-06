/**
 * components/ProviderCard.tsx
 * Card displayed in the /browse grid for each provider.
 */

import Link from 'next/link'
import { MapPin, BadgeCheck, DollarSign } from 'lucide-react'
import StarRating from './StarRating'
import type { ProviderCardData } from '@/types'

interface ProviderCardProps {
  provider: ProviderCardData
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const primarySkill = provider.skills?.[0]

  return (
    <div className="card group flex flex-col overflow-hidden animate-fade-in">
      {/* ── Photo ──────────────────────────────────────────────────────────── */}
      <div className="relative h-48 bg-gradient-to-br from-brand-100 to-accent-100 overflow-hidden">
        {provider.photo_url ? (
          <img
            src={provider.photo_url}
            alt={provider.full_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center text-4xl font-bold text-brand-600">
              {provider.full_name?.[0]?.toUpperCase()}
            </div>
          </div>
        )}

        {/* Verified badge */}
        {provider.is_verified && (
          <div className="absolute top-3 right-3 badge-blue shadow-sm">
            <BadgeCheck size={13} />
            Verified
          </div>
        )}

        {/* Price pill */}
        {primarySkill && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-sm font-bold text-gray-800 shadow-sm">
            <DollarSign size={14} className="text-brand-600" />
            {primarySkill.hourly_rate}/hr
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Name */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1">
            {provider.full_name}
          </h3>
        </div>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {provider.skills?.slice(0, 3).map((skill) => (
            <span key={skill.id} className="badge-gray text-xs">
              {skill.skill_name}
            </span>
          ))}
          {provider.skills?.length > 3 && (
            <span className="badge-gray text-xs">+{provider.skills.length - 3}</span>
          )}
        </div>

        {/* City */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
          <MapPin size={13} />
          {provider.city}
        </div>

        {/* Rating */}
        <div className="mb-3">
          <StarRating
            rating={provider.avg_rating || 0}
            size={14}
            showValue
            count={provider.review_count}
          />
        </div>

        {/* Bio excerpt */}
        {provider.bio && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {provider.bio}
          </p>
        )}

        {/* CTA */}
        <Link
          href={`/provider/${provider.id}`}
          className="btn-primary w-full text-sm py-2.5 mt-auto"
          id={`view-provider-${provider.id}`}
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}

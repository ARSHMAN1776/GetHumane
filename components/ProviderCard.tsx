import Link from 'next/link'
import { MapPin, BadgeCheck, Star, Zap } from 'lucide-react'
import type { ProviderCardData } from '@/types'

export default function ProviderCard({ provider }: { provider: ProviderCardData }) {
  const primarySkill = provider.skills?.[0]
  const minRate      = provider.skills?.length
    ? Math.min(...provider.skills.map(s => s.hourly_rate))
    : null

  return (
    <Link href={`/provider/${provider.id}`} className="group block">
      {/* Photo */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-100 to-accent-100 mb-3">
        {provider.photo_url ? (
          <img
            src={provider.photo_url}
            alt={provider.full_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-brand-300">
            {provider.full_name?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {provider.is_verified && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-bold text-brand-700 shadow-sm">
              <BadgeCheck size={11} className="text-brand-600" /> Verified
            </span>
          )}
          {(provider as any).is_pro && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/95 text-[11px] font-bold text-amber-900 shadow-sm">
              <Zap size={11} className="fill-amber-900" /> Pro
            </span>
          )}
        </div>

        {/* Price */}
        {minRate !== null && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-gray-950/80 backdrop-blur-sm text-white text-xs font-bold">
            from ${minRate}/hr
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-brand-700 transition-colors">
            {provider.full_name}
          </p>
          {provider.avg_rating > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-700 flex-shrink-0">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {provider.avg_rating.toFixed(1)}
              <span className="text-gray-400 font-normal">({provider.review_count})</span>
            </span>
          )}
        </div>

        <p className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
          <MapPin size={11} /> {provider.city}
        </p>

        {provider.skills?.length > 0 && (
          <p className="text-xs text-gray-500 line-clamp-1">
            {provider.skills.slice(0, 3).map(s => s.skill_name).join(' · ')}
            {provider.skills.length > 3 ? ` +${provider.skills.length - 3}` : ''}
          </p>
        )}
      </div>
    </Link>
  )
}

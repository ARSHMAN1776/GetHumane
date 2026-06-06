/**
 * components/StarRating.tsx
 * Reusable star rating display component.
 */

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number        // 1–5, supports decimals
  max?: number          // Default 5
  size?: number         // Icon size in px
  showValue?: boolean   // Show numeric value beside stars
  count?: number        // Show review count
}

export default function StarRating({
  rating,
  max = 5,
  size = 16,
  showValue = false,
  count,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const half   = !filled && i < rating
          return (
            <Star
              key={i}
              size={size}
              className={
                filled ? 'text-amber-400 fill-amber-400' :
                half   ? 'text-amber-400 fill-amber-200' :
                         'text-gray-200 fill-gray-200'
              }
            />
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-sm text-gray-400">({count})</span>
      )}
    </div>
  )
}

/**
 * components/ReviewCard.tsx
 * Displays a single review with star rating, reviewer info, and comment.
 */

import { formatDistanceToNow } from 'date-fns'
import StarRating from './StarRating'
import type { Review } from '@/types'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const reviewer = review.reviewer
  const initials = reviewer?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="card p-5">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 flex-shrink-0">
            {reviewer?.photo_url ? (
              <img
                src={reviewer.photo_url}
                alt={reviewer.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              {reviewer?.full_name ?? 'Anonymous'}
            </p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Star rating */}
        <StarRating rating={review.rating} size={14} />
      </div>

      {/* ── Comment ──────────────────────────────────────────────────────── */}
      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}
    </div>
  )
}

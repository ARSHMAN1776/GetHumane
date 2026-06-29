'use client'

import { useState } from 'react'
import { Star, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  bookingId:  string
  revieweeId: string
  revieweeName: string
  onSuccess?: () => void
}

export default function ReviewForm({ bookingId, revieweeId, revieweeName, onSuccess }: Props) {
  const [rating,    setRating]    = useState(0)
  const [hovered,  setHovered]   = useState(0)
  const [comment,  setComment]   = useState('')
  const [loading,  setLoading]   = useState(false)
  const [submitted,setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) { toast.error('Please select a star rating.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ booking_id: bookingId, reviewee_id: revieweeId, rating, comment: comment || null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to submit')
      setSubmitted(true)
      toast.success('Review submitted! Thank you.')
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-emerald-800 text-sm">Review submitted!</p>
          <p className="text-xs text-emerald-600 mt-0.5">Thank you for helping our community.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-1 text-sm">Leave a review for {revieweeName}</h3>
      <p className="text-xs text-gray-400 mb-4">How was your session? Your honest review helps the community.</p>

      {/* Star picker */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 focus:outline-none transition-transform hover:scale-110"
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              size={28}
              className={`transition-colors ${
                star <= (hovered || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-200 fill-gray-200'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-semibold text-gray-600">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        className="input resize-none mb-4 text-sm"
        placeholder={`What was your experience with ${revieweeName}? (optional)`}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{comment.length}/1000</p>
        <button
          type="submit"
          disabled={loading || !rating}
          className="btn-primary py-2 px-5 text-sm gap-2"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
}

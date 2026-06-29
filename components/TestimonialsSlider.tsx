import { Star } from 'lucide-react'

const testimonials = [
  { name: 'Maria G.', role: 'Seeker',   city: 'Austin, TX', quote: 'Found an amazing tutor for my daughter in minutes. So much better than a random online search.', rating: 5, initial: 'M', bg: 'bg-emerald-600' },
  { name: 'David L.', role: 'Provider', city: 'Chicago, IL', quote: 'GetHumane helped me turn my cooking skills into steady income. I love the community feel here.', rating: 5, initial: 'D', bg: 'bg-teal-600' },
  { name: 'Priya S.', role: 'Seeker',   city: 'New York, NY', quote: 'Background-checked providers gave me real confidence. Booked a gardener and was blown away.', rating: 5, initial: 'P', bg: 'bg-brand-700' },
  { name: 'Alex M.',  role: 'Seeker',   city: 'Seattle, WA', quote: 'The focus on real human interaction makes this marketplace completely unique. Highly recommended!', rating: 5, initial: 'A', bg: 'bg-indigo-600' },
  { name: 'Jordan K.',role: 'Provider', city: 'Boston, MA', quote: 'Listing my guitar classes here was so easy. Bookings and secure payments are handled beautifully.', rating: 5, initial: 'J', bg: 'bg-purple-600' },
]

// Duplicate reviews to create a seamless looping marquee
const duplicatedTestimonials = [...testimonials, ...testimonials]

export default function TestimonialsSlider() {
  return (
    <div className="relative w-full overflow-hidden py-4 select-none">
      {/* Left and Right Gradient Overlays for smooth edge fading */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-gray-50 via-gray-50/70 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-gray-50 via-gray-50/70 to-transparent z-10 pointer-events-none" />

      {/* Marquee Flex Container */}
      <div className="flex gap-6 animate-marquee w-max cursor-grab active:cursor-grabbing">
        {duplicatedTestimonials.map((t, idx) => (
          <div
            key={idx}
            className="w-[280px] sm:w-[320px] shrink-0 border border-gray-200 rounded-2xl bg-white p-5 flex flex-col justify-between hover:border-brand-500 hover:scale-[1.01] transition-all"
          >
            <div>
              {/* Rating */}
              <div className="flex gap-1 mb-3.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={13} className="text-amber-500 fill-amber-500" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 text-xs sm:text-sm italic leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
            </div>

            {/* Reviewer Details */}
            <div className="flex items-center gap-3 border-t border-gray-100 pt-3.5 w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${t.bg}`}>
                {t.initial}
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-xs">{t.name}</p>
                <p className="text-[10px] text-gray-400 font-medium">{t.role} &middot; {t.city}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

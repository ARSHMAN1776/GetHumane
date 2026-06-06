// ─── Shared TypeScript types for GetHumane ───────────────────────────────────

/** User roles on the platform */
export type UserRole = 'provider' | 'seeker'

/** Booking status lifecycle */
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

// ─── Database Row Types ────────────────────────────────────────────────────────

/** Row in the `users` table (extends Supabase auth.users) */
export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  city: string
  phone: string | null
  photo_url: string | null
  bio: string | null
  help_needed: string | null        // Seeker: what kind of help they need
  is_verified: boolean
  created_at: string
}

/** Row in the `skills` table */
export interface Skill {
  id: string
  user_id: string
  skill_name: string
  hourly_rate: number
  description: string | null
  created_at: string
}

/** Row in the `bookings` table */
export interface Booking {
  id: string
  provider_id: string
  seeker_id: string
  date_time: string
  location: string
  status: BookingStatus
  total_price: number
  message: string | null
  is_public_meetup: boolean
  created_at: string
  // Joined relations
  provider?: UserProfile
  seeker?: UserProfile
}

/** Row in the `reviews` table */
export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number              // 1–5
  comment: string | null
  created_at: string
  // Joined relation
  reviewer?: UserProfile
}

/** Row in the `waitlist` table */
export interface WaitlistEntry {
  id: string
  email: string
  created_at: string
}

/** Row in the `reports` table */
export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: string
  created_at: string
}

// ─── Composite / View Types ───────────────────────────────────────────────────

/** Provider card data used in browse page */
export interface ProviderCardData {
  id: string
  full_name: string
  photo_url: string | null
  city: string
  is_verified: boolean
  bio: string | null
  skills: Skill[]
  avg_rating: number
  review_count: number
}

/** Full provider profile for the /provider/[id] page */
export interface ProviderProfile extends ProviderCardData {
  reviews: Review[]
  phone: string | null
}

// ─── Form / Action Types ──────────────────────────────────────────────────────

export interface SignupFormData {
  full_name: string
  email: string
  password: string
  city: string
  phone: string
  role: UserRole
  bio?: string
  help_needed?: string
  skills?: Array<{ skill_name: string; hourly_rate: number; description: string }>
}

export interface BookingFormData {
  date_time: string
  location: string
  message: string
  is_public_meetup: boolean
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

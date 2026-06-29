/**
 * lib/validations.ts
 * Zod schemas for all API route inputs.
 */

import { z } from 'zod'

export const CreateBookingSchema = z.object({
  provider_id:      z.string().uuid('Invalid provider ID'),
  seeker_id:        z.string().uuid('Invalid seeker ID'),
  date_time:        z.string().datetime({ message: 'Invalid date/time format' }),
  location:         z.string().min(3, 'Location must be at least 3 characters').max(200),
  message:          z.string().max(1000).optional().nullable(),
  is_public_meetup: z.literal(true, { error: 'All sessions must be at a public location.' }),
  total_price:      z.number().positive('Price must be positive').max(10_000, 'Price exceeds maximum'),
})

export const UpdateBookingSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed'], {
    error: 'Status must be confirmed, cancelled, or completed',
  }),
})

export const ReportSchema = z.object({
  reported_user_id: z.string().uuid('Invalid user ID'),
  reason:           z.string().min(10, 'Please provide at least 10 characters').max(1000),
})

export const WaitlistSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
})

export const CreateReviewSchema = z.object({
  booking_id:  z.string().uuid('Invalid booking ID'),
  reviewee_id: z.string().uuid('Invalid reviewee ID'),
  rating:      z.number().int().min(1).max(5),
  comment:     z.string().max(1000).optional().nullable(),
})

export type CreateBookingInput  = z.infer<typeof CreateBookingSchema>
export type UpdateBookingInput  = z.infer<typeof UpdateBookingSchema>
export type ReportInput         = z.infer<typeof ReportSchema>
export type WaitlistInput       = z.infer<typeof WaitlistSchema>
export type CreateReviewInput   = z.infer<typeof CreateReviewSchema>

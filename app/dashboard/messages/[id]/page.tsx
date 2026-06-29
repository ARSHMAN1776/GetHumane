'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, User, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import MessageThread from '@/components/MessageThread'

interface Booking {
  id: string
  skill_name: string
  date_time: string
  status: string
  provider: { id: string; full_name: string; photo_url: string | null }
  seeker: { id: string; full_name: string; photo_url: string | null }
}

export default function MessagesPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createBrowserClient()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentId(user.id)

      const { data } = await supabase
        .from('bookings')
        .select(`
          id, skill_name, date_time, status,
          provider:users!bookings_provider_id_fkey(id,full_name,photo_url),
          seeker:users!bookings_seeker_id_fkey(id,full_name,photo_url)
        `)
        .eq('id', id)
        .single()

      if (!data) { router.push('/dashboard'); return }

      // Guard: only parties can view
      const b = data as any
      if (user.id !== b.provider?.id && user.id !== b.seeker?.id) {
        router.push('/dashboard'); return
      }

      setBooking(b)
      setLoading(false)
    }
    load()
  }, [id, supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-500" />
      </div>
    )
  }

  if (!booking || !currentId) return null

  const other = currentId === (booking.provider as any).id ? booking.seeker : booking.provider

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <Link href="/dashboard/messages" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Messages
        </Link>

        {/* Booking context card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold flex-shrink-0 overflow-hidden">
              {(other as any).photo_url
                ? <img src={(other as any).photo_url} alt="" className="w-full h-full object-cover" />
                : (other as any).full_name?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{(other as any).full_name}</p>
              <p className="text-xs text-gray-400">Conversation partner</p>
            </div>
            <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-brand-50 text-brand-700' :
                booking.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-gray-100 text-gray-600'
              }`}>
              {booking.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
            <span className="flex items-center gap-1.5">
              <User size={12} /> {booking.skill_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(booking.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Chat */}
        <MessageThread bookingId={booking.id} currentUserId={currentId} />
      </div>
    </div>
  )
}

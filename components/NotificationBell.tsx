'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, Calendar, MessageSquare, Check, Trash2, ShieldAlert } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'

interface NotificationItem {
  id: string
  title: string
  body: string
  time: string
  link: string
  type: 'booking' | 'message'
  read: boolean
}

export default function NotificationBell({ userId, role }: { userId: string; role: 'provider' | 'seeker' }) {
  const supabase = createBrowserClient()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      // 1. Fetch recent bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, status, skill_name, date_time, created_at, provider:users!bookings_provider_id_fkey(full_name), seeker:users!bookings_seeker_id_fkey(full_name)')
        .or(`provider_id.eq.${userId},seeker_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(5)

      // 2. Fetch unread messages
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id, booking_id, content, created_at, sender:users!messages_sender_id_fkey(full_name)')
        .eq('receiver_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5)

      const items: NotificationItem[] = []

      // Map bookings to notification items
      if (bookings) {
        bookings.forEach((b: any) => {
          const dateStr = new Date(b.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

          if (b.status === 'pending' && role === 'provider') {
            items.push({
              id: `booking-pending-${b.id}`,
              title: 'New Booking Request',
              body: `${b.seeker?.full_name || 'A seeker'} requested ${b.skill_name} on ${dateStr}`,
              time: b.created_at,
              link: '/dashboard/bookings',
              type: 'booking',
              read: false
            })
          } else if (b.status === 'confirmed') {
            items.push({
              id: `booking-confirmed-${b.id}`,
              title: 'Booking Confirmed',
              body: `Your session for ${b.skill_name} with ${role === 'provider' ? b.seeker?.full_name : b.provider?.full_name} is confirmed for ${dateStr}`,
              time: b.created_at,
              link: '/dashboard/bookings',
              type: 'booking',
              read: false
            })
          } else if (b.status === 'cancelled') {
            items.push({
              id: `booking-cancelled-${b.id}`,
              title: 'Booking Cancelled',
              body: `The session for ${b.skill_name} on ${dateStr} was cancelled`,
              time: b.created_at,
              link: '/dashboard/bookings',
              type: 'booking',
              read: false
            })
          }
        })
      }

      // Map unread messages
      if (unreadMessages) {
        unreadMessages.forEach((m: any) => {
          items.push({
            id: `msg-${m.id}`,
            title: `Message from ${m.sender?.full_name || 'Someone'}`,
            body: m.content,
            time: m.created_at,
            link: `/dashboard/messages/${m.booking_id}`,
            type: 'message',
            read: false
          })
        })
      }

      // Sort unified items by timestamp descending
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      setNotifications(items)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Real-time listener for bookings and messages
    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchNotifications())
      .subscribe()

    // Handle clicks outside dropdown to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      channel.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userId, role])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllRead = () => {
    // Client-side visual mark read
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={17} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
        )}
      </button>

      {/* Dropdown Panel - strictly flat borders, no shadows */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white border border-gray-200 rounded-2xl overflow-hidden z-50 text-left">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-extrabold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-brand-700 hover:text-brand-800 flex items-center gap-0.5 cursor-pointer"
              >
                <Check size={11} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={24} className="mx-auto text-gray-200 mb-2" />
                <p className="text-xs font-semibold">All caught up!</p>
                <p className="text-[10px] text-gray-400 mt-0.5">No new alerts or bookings.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = n.type === 'booking' ? Calendar : MessageSquare
                return (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => {
                      setIsOpen(false)
                      // Optionally mark individual item read
                    }}
                    className={`flex items-start gap-3 p-3.5 hover:bg-gray-50 transition-colors ${n.read ? 'opacity-60' : 'bg-brand-50/10'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${n.type === 'booking'
                        ? 'bg-teal-50 border-teal-100 text-teal-700'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      }`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{n.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">{n.body}</p>
                      <span className="text-[9px] text-gray-400 mt-1 block">
                        {new Date(n.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

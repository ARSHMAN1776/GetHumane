'use client'

/**
 * Real-time message thread for a booking.
 * Uses Supabase Realtime to push new messages without polling.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Message {
  id: string
  booking_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
  sender?: { id: string; full_name: string; photo_url: string | null }
}

interface Props {
  bookingId: string
  currentUserId: string
}

export default function MessageThread({ bookingId, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase  = createBrowserClient()

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  // ── Initial load ────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    const res  = await fetch(`/api/messages?booking_id=${bookingId}`)
    const json = await res.json()
    if (res.ok) setMessages(json.data ?? [])
    setLoading(false)
  }, [bookingId])

  useEffect(() => { fetchMessages() }, [fetchMessages])
  useEffect(() => { scrollToBottom() }, [messages])

  // ── Supabase Realtime subscription ──────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
        async (payload) => {
          // Fetch sender info for the new message
          const { data: msg } = await supabase
            .from('messages')
            .select('*, sender:users!messages_sender_id_fkey(id,full_name,photo_url)')
            .eq('id', payload.new.id)
            .single()
          if (msg) setMessages((prev) => [...prev, msg])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId, supabase])

  // ── Send ────────────────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending) return

    setSending(true)
    setInput('')
    try {
      const res  = await fetch('/api/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ booking_id: bookingId, content }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? 'Failed to send')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" style={{ height: 420 }}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <MessageSquare size={16} className="text-brand-500" />
        <h3 className="font-semibold text-gray-900 text-sm">Messages</h3>
        <span className="ml-auto text-xs text-gray-400">{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No messages yet. Say hello!
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-brand-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-brand-700 overflow-hidden">
                {msg.sender?.photo_url
                  ? <img src={msg.sender.photo_url} alt="" className="w-full h-full object-cover" />
                  : msg.sender?.full_name?.[0]?.toUpperCase()
                }
              </div>
              {/* Bubble */}
              <div
                className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                {msg.content}
                <p className={`text-[10px] mt-1 ${isMine ? 'text-brand-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  {!isMine && msg.read_at && <span className="ml-1">· read</span>}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          maxLength={2000}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-400 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 disabled:opacity-40 transition flex-shrink-0"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  )
}

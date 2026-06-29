'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PushNotificationSetup() {
  const [supported,    setSupported]    = useState(false)
  const [subscribed,   setSubscribed]   = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [permission,   setPermission]   = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true)
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(!!sub)
    } catch {}
  }

  const subscribe = async () => {
    setLoading(true)
    try {
      const permResult = await Notification.requestPermission()
      setPermission(permResult)
      if (permResult !== 'granted') {
        toast.error('Please allow notifications in your browser settings.')
        return
      }

      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Get VAPID key
      const keyRes = await fetch('/api/push')
      const keyJson = await keyRes.json()
      if (!keyRes.ok) {
        toast('Push notifications not fully configured yet.', { icon: '⚠️' })
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(keyJson.data.vapidPublicKey).buffer as ArrayBuffer,
      })

      const saveRes = await fetch('/api/push', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(sub.toJSON()),
      })

      if (!saveRes.ok) throw new Error('Failed to save subscription')
      setSubscribed(true)
      toast.success('Notifications enabled!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to enable notifications')
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push', {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
      toast.success('Notifications disabled.')
    } catch (err) {
      toast.error('Failed to disable notifications')
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        subscribed ? 'bg-brand-50' : 'bg-gray-50'
      }`}>
        {subscribed
          ? <Bell size={16} className="text-brand-600" />
          : <BellOff size={16} className="text-gray-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">
          {subscribed ? 'Notifications On' : 'Enable Notifications'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {subscribed
            ? 'You\'ll be notified about new bookings and messages.'
            : permission === 'denied'
              ? 'Blocked — enable in browser settings.'
              : 'Get instant alerts for booking requests.'
          }
        </p>
      </div>
      {permission !== 'denied' && (
        <button
          onClick={subscribed ? unsubscribe : subscribe}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
            subscribed
              ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : subscribed ? <BellOff size={12} /> : <Bell size={12} />}
          {subscribed ? 'Turn off' : 'Enable'}
        </button>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  return Uint8Array.from(raw.split('').map(c => c.charCodeAt(0)))
}

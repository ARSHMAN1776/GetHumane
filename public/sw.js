// GetHumane Service Worker — Push Notifications + PWA Cache
const CACHE_NAME = 'gethumane-v2'
const STATIC_ASSETS = ['/', '/browse', '/dashboard', '/offline']
const OFFLINE_URL = '/offline'

// Install: cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => {})
  )
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return
  // Skip API routes from cache
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request).then(cached => cached || caches.match(OFFLINE_URL)))
  )
})

// Push: display notification
self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload
  try { payload = event.data.json() }
  catch { payload = { title: 'GetHumane', body: event.data.text() } }

  const { title = 'GetHumane', body = 'You have a new notification', url = '/dashboard', icon } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  icon || '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      data:  { url },
      actions: [{ action: 'open', title: 'Open' }],
    })
  )
})

// Notification click: focus or open the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) { existing.focus(); existing.navigate(url) }
      else self.clients.openWindow(url)
    })
  )
})

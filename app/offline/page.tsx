'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-brand-900/50 border border-brand-800/50 flex items-center justify-center mx-auto mb-6">
          <WifiOff size={36} className="text-brand-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">You&apos;re offline</h1>
        <p className="text-white/50 max-w-sm mx-auto mb-8 leading-relaxed">
          No internet connection. Pages you&apos;ve visited recently are available below.
          Reconnect to browse providers and manage bookings.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
          >
            <RefreshCw size={15} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white/70 text-sm border border-white/10 hover:border-white/20 hover:text-white transition-colors"
          >
            Go Home
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[
            { label: 'Browse',    href: '/browse' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Home',      href: '/' },
          ].map(p => (
            <Link
              key={p.href}
              href={p.href}
              className="py-2 px-3 bg-white/5 border border-white/10 rounded-xl text-white/50 text-xs font-semibold hover:text-white/80 hover:border-white/20 transition-colors text-center"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

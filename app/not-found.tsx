import Link from 'next/link'
import { Search, ArrowLeft, Home } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 — Page Not Found | GetHumane' }

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-700 rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        <p className="text-8xl font-bold text-brand-500 mb-4 leading-none">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">This page doesn't exist</h1>
        <p className="text-white/40 mb-10 leading-relaxed">
          The page you're looking for has moved, been deleted, or never existed. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary py-3 px-6">
            <Home size={16} />
            Back to Home
          </Link>
          <Link href="/browse" className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white/70 border border-white/15 hover:bg-white/8 hover:text-white transition-all">
            <Search size={16} />
            Browse Skills
          </Link>
        </div>
      </div>
    </div>
  )
}

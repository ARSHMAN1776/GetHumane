/**
 * app/layout.tsx
 * Root layout — wraps every page with Navbar, Footer, and Toast notifications.
 */

import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WaitlistPopup from '@/components/WaitlistPopup'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'GetHumane — Connect with Real People and Real Skills',
    template: '%s | GetHumane',
  },
  description:
    'AI took jobs. Humans still need humans. GetHumane connects people who lost jobs to AI with lonely people who need genuine connection and real skills.',
  keywords: ['human skills', 'connection', 'gig economy', 'AI displacement', 'freelance', 'skills marketplace'],
  openGraph: {
    title: 'GetHumane — Connect with Real People and Real Skills',
    description: 'AI took jobs. Humans still need humans.',
    type: 'website',
    siteName: 'GetHumane',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GetHumane',
    description: 'AI took jobs. Humans still need humans.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Toast notification container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#0ea5e9', secondary: 'white' },
            },
          }}
        />

        {/* Navigation */}
        <Navbar />

        {/* Page content — pt-16 offsets the fixed navbar */}
        <main className="min-h-screen pt-16">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating waitlist popup — shown on every page */}
        <WaitlistPopup />
      </body>
    </html>
  )
}

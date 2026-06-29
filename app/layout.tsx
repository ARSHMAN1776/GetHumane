/**
 * app/layout.tsx
 * Root layout — wraps every page with Navbar, Footer, and Toast notifications.
 */

import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import NavbarWrapper from '@/components/NavbarWrapper'
import Footer from '@/components/Footer'
import MainWrapper from '@/components/MainWrapper'
import WaitlistPopup from '@/components/WaitlistPopup'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-jakarta',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gethumane.com'

export const metadata: Metadata = {
  title: {
    default: 'GetHumane — Connect with Real People and Real Skills',
    template: '%s | GetHumane',
  },
  description:
    'The neighborhood where skills live. GetHumane connects people who need real human skills with local providers — safely, affordably, and with genuine connection.',
  keywords: [
    'skill sharing', 'local skills', 'human connection', 'gig economy',
    'find tutor', 'guitar lessons', 'cooking lessons', 'local freelance',
    'skills marketplace', 'book a skill', 'community skills',
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'GetHumane — Connect with Real People and Real Skills',
    description: 'The neighborhood where skills live. Book real people, real skills, near you.',
    type: 'website',
    siteName: 'GetHumane',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GetHumane — Real Skills. Real People. Near You.',
    description: 'Book local skill providers — guitar, cooking, coding, fitness and more. Safety-first marketplace.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GetHumane',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className={jakarta.className}>
        {/* Toast notification container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#0d9488', secondary: 'white' },
            },
          }}
        />

        {/* Navigation */}
        <NavbarWrapper />

        <MainWrapper>{children}</MainWrapper>

        {/* Footer */}
        <Footer />

        {/* Floating waitlist popup — shown on every page */}
        <WaitlistPopup />

        {/* PWA install prompt — shown when browser supports it */}
        <PWAInstallPrompt />
      </body>
    </html>
  )
}

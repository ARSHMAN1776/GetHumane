'use client'

import { usePathname } from 'next/navigation'

/** Routes that own the full viewport — no navbar offset (pt-16). */
const FULL_SCREEN = ['/dashboard', '/login', '/signup']

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const fullScreen = FULL_SCREEN.some((p) => pathname?.startsWith(p))
  return (
    <main className={fullScreen ? 'min-h-screen' : 'min-h-screen pt-16'}>
      {children}
    </main>
  )
}

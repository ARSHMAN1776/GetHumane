'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

/** Routes that render their own full-screen chrome and must not show the global navbar. */
const HIDE_ON = ['/dashboard', '/login', '/signup']

export default function NavbarWrapper() {
  const pathname = usePathname()
  if (HIDE_ON.some((p) => pathname?.startsWith(p))) return null
  return <Navbar />
}

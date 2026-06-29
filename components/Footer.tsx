'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, MessageCircle, Code2, Briefcase } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Browse Skills',   href: '/browse' },
    { label: 'Offer a Skill',   href: '/signup' },
    { label: 'How It Works',    href: '/how-it-works' },
  ],
  Support: [
    { label: 'Safety Center',   href: '/safety' },
    { label: 'Help Center',     href: '/help' },
    { label: 'Contact Us',      href: '/contact' },
  ],
  Company: [
    { label: 'About',           href: '/about' },
    { label: 'Blog',            href: '/blog' },
    { label: 'Careers',         href: '/careers' },
  ],
  Legal: [
    { label: 'Privacy Policy',  href: '/privacy' },
    { label: 'Terms of Service',href: '/terms' },
    { label: 'Cookie Policy',   href: '/privacy#cookies' },
  ],
}

const socials = [
  { icon: <MessageCircle size={18} />, href: '#', label: 'Twitter'  },
  { icon: <Code2 size={18} />,         href: '#', label: 'GitHub'   },
  { icon: <Briefcase size={18} />,     href: '#', label: 'LinkedIn' },
]

export default function Footer() {
  const pathname = usePathname()
  if (['/dashboard', '/login', '/signup'].some((p) => pathname?.startsWith(p))) return null
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container-app py-16">

        {/* ── Top section ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600">
                <Heart size={18} fill="white" />
              </span>
              Get<span className="text-brand-400">Humane</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              AI took jobs. Humans still need humans. We connect real people
              with real skills to those who need genuine connection.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-600 text-gray-400 hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────────── */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} GetHumane. All rights reserved.
          </p>
          <p className="text-sm flex items-center gap-1.5">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> for humans, by humans.
          </p>
        </div>
      </div>
    </footer>
  )
}

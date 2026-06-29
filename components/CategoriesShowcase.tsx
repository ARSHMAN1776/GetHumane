'use client'

import Link from 'next/link'
import {
  Music, Utensils, BookOpen, Leaf, Dumbbell, Code2,
  Palette, Camera, Languages, ChevronRight
} from 'lucide-react'

const categories = [
  { Icon: Music,     label: 'Music Lessons',    count: '340+', bg: 'bg-purple-50', ic: 'text-purple-700', border: 'border-purple-100' },
  { Icon: Utensils,  label: 'Cooking & Baking', count: '280+', bg: 'bg-amber-50',  ic: 'text-amber-700', border: 'border-amber-100'  },
  { Icon: BookOpen,  label: 'Tutoring',          count: '520+', bg: 'bg-blue-50',   ic: 'text-blue-700', border: 'border-blue-100'   },
  { Icon: Leaf,      label: 'Gardening',         count: '190+', bg: 'bg-emerald-50',ic: 'text-emerald-700', border: 'border-emerald-100'  },
  { Icon: Dumbbell,  label: 'Fitness & Yoga',    count: '210+', bg: 'bg-rose-50',    ic: 'text-rose-700', border: 'border-rose-100'    },
  { Icon: Code2,     label: 'Coding Help',       count: '160+', bg: 'bg-indigo-50', ic: 'text-indigo-700', border: 'border-indigo-100' },
  { Icon: Palette,   label: 'Art & Drawing',     count: '175+', bg: 'bg-pink-50',   ic: 'text-pink-700', border: 'border-pink-100'   },
  { Icon: Camera,    label: 'Photography',       count: '130+', bg: 'bg-teal-50',   ic: 'text-teal-700', border: 'border-teal-100'   },
  { Icon: Languages, label: 'Language Lessons',  count: '245+', bg: 'bg-orange-50', ic: 'text-orange-700', border: 'border-orange-100' },
]

export default function CategoriesShowcase() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map(({ Icon, label, count, bg, ic, border }) => (
        <Link
          key={label}
          href={`/browse?q=${encodeURIComponent(label)}`}
          className={`group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-200 hover:border-brand-500 transition-colors text-center`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} border ${border} group-hover:scale-105 transition-transform`}>
            <Icon size={20} strokeWidth={1.75} className={ic} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-[13px]">{label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{count} providers</p>
          </div>
        </Link>
      ))}
      <Link
        href="/browse"
        className="flex flex-col items-center justify-center gap-2 p-5 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50/10 transition-colors text-center"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-400">
          <ChevronRight size={18} />
        </div>
        <div>
          <p className="font-bold text-gray-500 text-[13px]">View All</p>
          <p className="text-[11px] text-gray-400 mt-0.5">200+ skills</p>
        </div>
      </Link>
    </div>
  )
}

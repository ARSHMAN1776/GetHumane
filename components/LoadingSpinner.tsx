/**
 * components/LoadingSpinner.tsx
 * Reusable loading indicator.
 */

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

const sizeMap = { sm: 16, md: 24, lg: 40 }

export default function LoadingSpinner({
  text = 'Loading...',
  size = 'md',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const iconSize = sizeMap[size]

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={iconSize} className="text-brand-600 animate-spin" />
          {text && <p className="text-sm font-medium text-gray-500">{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={iconSize} className="text-brand-600 animate-spin" />
        {text && <p className="text-sm font-medium text-gray-500">{text}</p>}
      </div>
    </div>
  )
}

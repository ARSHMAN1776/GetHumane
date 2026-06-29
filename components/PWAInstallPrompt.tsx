'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'gethumane_pwa_dismissed'

export default function PWAInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible,     setVisible]     = useState(false)
  const [installing,  setInstalling]  = useState(false)

  useEffect(() => {
    // Don't show if previously dismissed or already installed
    if (localStorage.getItem(DISMISSED_KEY)) return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !promptEvent) return null

  const install = async () => {
    setInstalling(true)
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'dismissed') setInstalling(false)
    setVisible(false)
  }

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}>
          <Smartphone size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Add GetHumane to Home Screen</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Install the app for faster access and offline browsing.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={install}
              disabled={installing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
            >
              <Download size={12} />
              {installing ? 'Installing…' : 'Install'}
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, Gift, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReferralData {
  referralCode:       string
  referralLink:       string
  totalReferrals:     number
  convertedReferrals: number
  creditsEarned:      number
}

export default function ReferralWidget() {
  const [data,    setData]    = useState<ReferralData | null>(null)
  const [copied,  setCopied]  = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(j => { if (j.data) setData(j.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const copyLink = async () => {
    if (!data?.referralLink) return
    try {
      await navigator.clipboard.writeText(data.referralLink)
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
          <Gift size={15} className="text-brand-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Invite & Earn</p>
          <p className="text-xs text-gray-400">Both of you get $10 credit</p>
        </div>
        {data.creditsEarned > 0 && (
          <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            ${data.creditsEarned} earned
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 truncate">
          {data.referralLink}
        </div>
        <button
          onClick={copyLink}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
            copied ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {(data.totalReferrals > 0) && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users size={12} />
            <span><strong className="text-gray-800">{data.totalReferrals}</strong> invited</span>
          </div>
          <div className="text-xs text-gray-500">
            <strong className="text-gray-800">{data.convertedReferrals}</strong> joined
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

/**
 * components/ReportButton.tsx
 * Client component — report user button used on provider profile page.
 * Extracted from a Server Component to allow the onClick fetch call.
 */

import { useState } from 'react'
import { Flag, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReportButtonProps {
  reportedUserId: string
}

export default function ReportButton({ reportedUserId }: ReportButtonProps) {
  const [loading, setLoading]   = useState(false)
  const [reported, setReported] = useState(false)

  const handleReport = async () => {
    if (reported) return
    setLoading(true)
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reported_user_id: reportedUserId,
          reason: 'User-reported from profile page',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit report')
      setReported(true)
      toast.success('Report submitted. Our safety team will review it.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleReport}
      disabled={loading || reported}
      id="report-user-btn"
      className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-60 w-full"
    >
      {loading ? (
        <><Loader2 size={12} className="animate-spin" /> Reporting...</>
      ) : reported ? (
        <><CheckCircle size={12} className="text-emerald-500" /> Reported</>
      ) : (
        <><Flag size={12} /> Report this user</>
      )}
    </button>
  )
}

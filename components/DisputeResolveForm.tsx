'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  disputeId: string
  onResolved: (id: string) => void
}

export default function DisputeResolveForm({ disputeId, onResolved }: Props) {
  const [open,   setOpen]   = useState(false)
  const [note,   setNote]   = useState('')
  const [saving, setSaving] = useState(false)

  const resolve = async (decision: 'refund' | 'close') => {
    if (note.trim().length < 5) { toast.error('Resolution note must be at least 5 characters'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/dispute/${disputeId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ decision, resolution_note: note.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(decision === 'refund' ? 'Refund issued — dispute resolved.' : 'Dispute closed — no refund.')
      onResolved(disputeId)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-semibold text-orange-400 hover:text-orange-200 underline underline-offset-2 transition-colors"
      >
        Resolve dispute →
      </button>
    )
  }

  return (
    <div className="mt-3 space-y-2 bg-white/5 border border-white/10 rounded-xl p-3">
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={2}
        placeholder="Resolution note (min 5 chars)…"
        className="w-full text-xs bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white/80 placeholder-white/20 focus:outline-none focus:border-brand-500 resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={() => resolve('refund')}
          disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
          Issue Refund
        </button>
        <button
          onClick={() => resolve('close')}
          disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
          Close (no refund)
        </button>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

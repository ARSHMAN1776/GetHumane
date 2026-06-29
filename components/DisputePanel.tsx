'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import DisputeResolveForm from './DisputeResolveForm'

interface Dispute {
  id: string
  reason: string
  evidence_text: string | null
  created_at: string
  opener: { full_name: string } | null
}

interface Props {
  disputes: Dispute[]
  openCount: number
}

export default function DisputePanel({ disputes: initial, openCount }: Props) {
  const [disputes, setDisputes] = useState(initial)

  const remove = (id: string) => setDisputes(prev => prev.filter(d => d.id !== id))

  if (!disputes.length) {
    return <p className="text-white/30 text-sm px-5 py-8 text-center">No open disputes. ✓</p>
  }

  return (
    <div className="divide-y divide-white/5">
      {disputes.map((d) => (
        <div key={d.id} className="px-5 py-4">
          <div className="flex items-start justify-between gap-3 mb-1">
            <p className="text-white text-sm font-semibold">{d.opener?.full_name ?? 'Unknown'}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full flex-shrink-0">
              {d.reason?.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-white/40 text-xs line-clamp-2">{d.evidence_text}</p>
          <p className="text-white/20 text-xs mt-1">{new Date(d.created_at).toLocaleDateString()}</p>
          <DisputeResolveForm disputeId={d.id} onResolved={remove} />
        </div>
      ))}
    </div>
  )
}

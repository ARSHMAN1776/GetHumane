import { BadgeCheck, ShieldCheck, Star, Clock, Users } from 'lucide-react'

interface TrustSignals {
  is_verified:     boolean
  bg_check_clear:  boolean
  avg_rating:      number | null
  session_count:   number
  response_rate:   number | null
}

interface Props extends TrustSignals {
  size?: 'sm' | 'md' | 'lg'
  showBreakdown?: boolean
}

function computeScore(s: TrustSignals): number {
  let score = 0
  if (s.is_verified)    score += 30
  if (s.bg_check_clear) score += 25
  if (s.avg_rating) {
    score += Math.min(20, Math.round((s.avg_rating / 5) * 20))
  }
  if (s.session_count >= 5)  score += 10
  if (s.session_count >= 20) score += 10
  if (s.response_rate) {
    score += Math.min(5, Math.round(s.response_rate / 20))
  }
  return Math.min(100, score)
}

function scoreLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: 'Elite',     color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' }
  if (score >= 65) return { label: 'Trusted',   color: 'text-brand-700',   bg: 'bg-brand-50 border-brand-200' }
  if (score >= 40) return { label: 'Verified',  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' }
  return              { label: 'New',       color: 'text-gray-500',    bg: 'bg-gray-50 border-gray-200' }
}

export default function TrustScore({
  is_verified, bg_check_clear, avg_rating, session_count, response_rate,
  size = 'md', showBreakdown = false,
}: Props) {
  const score  = computeScore({ is_verified, bg_check_clear, avg_rating, session_count, response_rate })
  const { label, color, bg } = scoreLabel(score)

  const signals = [
    { icon: <BadgeCheck size={12} />, label: 'ID Verified',   done: is_verified,    points: 30 },
    { icon: <ShieldCheck size={12} />, label: 'Background Check', done: bg_check_clear, points: 25 },
    { icon: <Star size={12} />,        label: 'High Rating',  done: (avg_rating ?? 0) >= 4, points: 20 },
    { icon: <Users size={12} />,       label: '5+ Sessions',  done: session_count >= 5, points: 20 },
    { icon: <Clock size={12} />,       label: 'Responsive',   done: (response_rate ?? 0) >= 80, points: 5 },
  ]

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${bg} ${color}`}>
        <span className="text-[10px]">{score}</span>
        {label}
      </span>
    )
  }

  const ring = score >= 85 ? 'text-emerald-500' : score >= 65 ? 'text-brand-500' : score >= 40 ? 'text-blue-500' : 'text-gray-400'
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring chart */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r={r} stroke="currentColor" strokeWidth="5" fill="none" className="text-gray-100" />
          <circle
            cx="32" cy="32" r={r}
            stroke="currentColor" strokeWidth="5" fill="none"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className={`${ring} transition-all duration-700`}
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-sm font-black text-gray-900 leading-none">{score}</p>
        </div>
      </div>

      {/* Label */}
      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${bg} ${color}`}>
        {label} Provider
      </span>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="w-full space-y-1.5 mt-1">
          {signals.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={s.done ? 'text-emerald-500' : 'text-gray-300'}>{s.icon}</span>
              <span className={`text-xs flex-1 ${s.done ? 'text-gray-700' : 'text-gray-400'}`}>{s.label}</span>
              <span className={`text-[10px] font-bold ${s.done ? 'text-emerald-600' : 'text-gray-300'}`}>
                {s.done ? `+${s.points}` : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

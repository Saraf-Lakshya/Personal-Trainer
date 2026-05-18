import { useEffect } from 'react'
import { SkipForward } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'

const TOTAL = 10 * 60
const CIRC = 2 * Math.PI * 80

export default function WarmupCooldown({ phase, onDone }) {
  const { seconds, start } = useTimer(TOTAL, onDone)

  useEffect(() => { start(TOTAL) }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const progress = seconds / TOTAL
  const isWarmup = phase === 'warmup'

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 p-8">
      <div className="text-center">
        <div className="text-5xl mb-3">{isWarmup ? '🔥' : '🧘'}</div>
        <h2 className="text-2xl font-bold text-white">{isWarmup ? 'Warm Up' : 'Cool Down'}</h2>
        <p className="text-gray-400 text-sm mt-1 max-w-xs">
          {isWarmup
            ? 'Light cardio or dynamic stretches — get the blood flowing'
            : 'Static stretches and slow controlled breathing'}
        </p>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="192" height="192" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="80" fill="none" stroke="#1f2937" strokeWidth="10" />
          <circle
            cx="96" cy="96" r="80"
            fill="none"
            stroke={isWarmup ? '#f97316' : '#60a5fa'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="text-center">
          <span className="text-5xl font-bold tabular-nums text-white">
            {mins}:{String(secs).padStart(2, '0')}
          </span>
          <p className="text-gray-500 text-xs mt-1">remaining</p>
        </div>
      </div>

      <button
        onClick={onDone}
        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gray-800 text-gray-200 font-semibold active:bg-gray-700 border border-gray-700"
      >
        <SkipForward size={18} />
        Skip {isWarmup ? 'Warm Up' : 'Cool Down'}
      </button>
    </div>
  )
}

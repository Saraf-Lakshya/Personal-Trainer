import { useEffect, useState } from 'react'
import { SkipForward, Plus } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function RestTimer({ duration, onDone, onSkip }) {
  const { seconds, start, reset, add } = useTimer(duration, onDone)
  // The duration the current countdown is measured against — changes when the
  // user picks a different preset or adds time, so the ring stays accurate.
  const [activeDuration, setActiveDuration] = useState(duration)

  useEffect(() => {
    setActiveDuration(duration)
    reset(duration)
    start(duration)
  }, [duration])

  useEffect(() => {
    if (seconds === 0) return
    if (seconds <= 3 && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, [seconds])

  useEffect(() => {
    if (seconds === 0 && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }, [seconds])

  const progress = Math.min(1, Math.max(0, seconds / activeDuration))
  const dashoffset = CIRCUMFERENCE * (1 - progress)
  const isDone = seconds === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-8 p-8">

        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">Rest</p>
        </div>

        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#1f2937" strokeWidth="8" />
            <circle
              cx="80" cy="80" r={RADIUS}
              fill="none"
              stroke={isDone ? '#22c55e' : '#f97316'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <div className="text-center">
            <span className={`text-5xl font-bold tabular-nums ${isDone ? 'text-green-400' : 'text-white'}`}>
              {isDone ? '✓' : seconds}
            </span>
            {!isDone && <p className="text-gray-500 text-xs mt-1">seconds</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => { add(15); setActiveDuration(d => Math.max(d, seconds + 15)) }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium active:bg-gray-700"
          >
            <Plus size={14} /> 15s
          </button>

          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold active:bg-orange-600"
          >
            <SkipForward size={18} />
            Skip Rest
          </button>
        </div>

        <div className="flex gap-3">
          {[60, 90].map(s => (
            <button
              key={s}
              onClick={() => { setActiveDuration(s); reset(s); start(s) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeDuration === s ? 'bg-gray-700 text-white' : 'bg-gray-800/60 text-gray-500 active:bg-gray-700'
              }`}
            >
              {s}s
            </button>
          ))}
        </div>

        <button onClick={onSkip} className="text-gray-600 text-xs active:text-gray-400">
          dismiss
        </button>
      </div>
    </div>
  )
}

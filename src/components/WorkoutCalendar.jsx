import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SESSION_META, getSessionColor } from '../data/workoutPlan'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function WorkoutCalendar({ history }) {
  const [monthsBack, setMonthsBack] = useState(0)
  const now = new Date()
  const view = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
  const year = view.getFullYear()
  const month = view.getMonth()

  // Group sessions onto local calendar days of the viewed month
  const byDay = {}
  for (const s of history) {
    const d = new Date(s.date)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      ;(byDay[day] ||= []).push(s)
    }
  }

  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const monthCount = Object.values(byDay).reduce((a, arr) => a + arr.length, 0)
  const isThisMonth = monthsBack === 0
  const hasOlder = history.some(s => new Date(s.date) < new Date(year, month, 1))

  // Distinct session keys trained this month, for a compact legend
  const keysThisMonth = [...new Set(Object.values(byDay).flat().map(s => s.sessionKey))].sort()

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMonthsBack(m => m + 1)}
          disabled={!hasOlder}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 active:bg-gray-700 disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{MONTHS[month]} {year}</p>
          <p className="text-xs text-gray-500">{monthCount} session{monthCount === 1 ? '' : 's'}</p>
        </div>
        <button
          onClick={() => setMonthsBack(m => Math.max(0, m - 1))}
          disabled={isThisMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 active:bg-gray-700 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-600 font-medium">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />
          const sessions = byDay[day]
          const isToday = isThisMonth && day === now.getDate()
          const color = sessions ? getSessionColor(sessions[0].sessionKey) : null
          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium ${
                color ? `${color.bg} text-white` : 'bg-gray-800/40 text-gray-600'
              } ${isToday ? 'ring-2 ring-white/70' : ''}`}
            >
              {day}
            </div>
          )
        })}
      </div>

      {keysThisMonth.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-gray-800">
          {keysThisMonth.map(k => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${getSessionColor(k).bg}`} />
              <span className="text-[10px] text-gray-500">{SESSION_META[k]?.label ?? k}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

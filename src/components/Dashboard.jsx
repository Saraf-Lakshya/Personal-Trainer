import { useState } from 'react'
import { TrendingUp, TrendingDown, ChevronRight, Check, Plus, Download } from 'lucide-react'
import { SESSIONS, SESSION_META, WEEKS, getSessionColor, getTodayScheduleInfo } from '../data/workoutPlan'

function exportCsv(sessions) {
  const rows = ['Date,Session,Exercise,Set,Weight (kg),Reps,Duration (s)']
  for (const s of sessions) {
    const label = SESSION_META[s.sessionKey]?.label ?? s.sessionKey
    if (!s.exercises?.length) {
      rows.push(`${s.date},${label},,,,`)
      continue
    }
    for (const ex of s.exercises) {
      for (let i = 0; i < ex.sets.length; i++) {
        const set = ex.sets[i]
        if (!set.completed) continue
        rows.push(`${s.date},${label},${ex.exerciseName},${i + 1},${set.weight || ''},${set.reps || ''},${set.duration || ''}`)
      }
    }
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `workouts-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const SESSION_ORDER = ['A', 'B', 'C', 'D', 'E']

export default function Dashboard({ history, user, weights, onLogWeight, onStartWorkout, onSignOut, onChangePassword }) {
  const [showMenu, setShowMenu] = useState(false)
  const { weekType, todayName } = getTodayScheduleInfo()

  const weekSessions = (() => {
    const weekStart = new Date()
    const dow = weekStart.getDay()
    weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1))
    weekStart.setHours(0, 0, 0, 0)
    return history.filter(h => new Date(h.date) >= weekStart).length
  })()

  const weeklyGoal = WEEKS[weekType]?.count ?? 4

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="px-5 pt-12 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{todayName}</h1>
          <p className="text-sm text-gray-500 mt-1">Week {weekType}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(m => !m)} className="active:opacity-70">
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border border-gray-700" />
              : <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-300 font-bold">
                  {(user?.user_metadata?.full_name ?? user?.email ?? '?')[0].toUpperCase()}
                </div>
            }
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-10 z-50 w-44 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
                <div className="px-3 py-2.5 border-b border-gray-700">
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setShowMenu(false); onChangePassword() }}
                  className="w-full px-3 py-3 text-left text-sm text-gray-200 active:bg-gray-700"
                >
                  🔑 Change Password
                </button>
                <button
                  onClick={() => { setShowMenu(false); exportCsv(history) }}
                  className="w-full px-3 py-3 text-left text-sm text-gray-200 active:bg-gray-700 border-t border-gray-700 flex items-center gap-2"
                >
                  <Download size={14} /> Export CSV
                </button>
                <button
                  onClick={() => { setShowMenu(false); onSignOut() }}
                  className="w-full px-3 py-3 text-left text-sm text-red-400 active:bg-gray-700 border-t border-gray-700"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body weight + weekly goal */}
      <div className="px-5">
        <BodyWeightRow weights={weights} onLogWeight={onLogWeight} />
        <WeeklyGoalRow done={weekSessions} goal={weeklyGoal} />
      </div>

      {/* Session list */}
      <div className="px-5 pb-32">
        <div className="border-t border-gray-800 pt-5 pb-2">
          <p className="text-sm text-gray-500">What are we doing today?</p>
        </div>
        {SESSION_ORDER.map(key => {
          const s = SESSIONS[key]
          const meta = SESSION_META[key]
          const c = getSessionColor(key)
          return (
            <button
              key={key}
              onClick={() => onStartWorkout(key)}
              className="w-full flex items-center gap-3 py-4 border-b border-gray-800 last:border-0 text-left active:opacity-70"
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.bg}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">
                  {meta.label}{s.isHomeSession ? ' 🏠' : ''}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{meta.muscles}</p>
              </div>
              <ChevronRight size={18} className="text-gray-700 flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Sparkline({ values, width = 100, height = 30, color = '#f97316' }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible flex-shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WeeklyGoalRow({ done, goal }) {
  const filled = Math.min(done, goal)
  const extra = Math.max(0, done - goal)
  const hit = done >= goal
  return (
    <div className="flex items-center justify-between py-4 border-t border-gray-800">
      <span className="text-sm text-gray-400">This week</span>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: goal }).map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i < filled ? (hit ? 'bg-green-400' : 'bg-orange-500') : 'bg-gray-700'}`} />
          ))}
        </div>
        <span className="text-sm text-gray-500 tabular-nums">
          {done} of {goal}{extra > 0 ? ` +${extra}` : ''}
        </span>
      </div>
    </div>
  )
}

function BodyWeightRow({ weights, onLogWeight }) {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(false)

  const latest = weights[weights.length - 1]
  const prev = weights[weights.length - 2]
  const delta = latest && prev ? Math.round((latest.weight - prev.weight) * 10) / 10 : null

  const openInput = () => {
    setVal(latest ? String(latest.weight) : '')
    setErr(false)
    setOpen(true)
  }

  const submit = async () => {
    const w = parseFloat(val)
    if (!w || w <= 0) return
    setSaving(true)
    setErr(false)
    try {
      await onLogWeight(w)
      setOpen(false)
      setVal('')
    } catch (e) {
      console.error('Log weight failed:', e)
      setErr(true)
    } finally {
      setSaving(false)
    }
  }

  if (open) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="kg"
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-center font-mono text-base focus:border-orange-500 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={saving || !val}
            className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center active:bg-orange-600 disabled:opacity-40 flex-shrink-0"
          >
            <Check size={18} />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-3 h-11 rounded-xl bg-gray-900 text-gray-400 text-sm active:bg-gray-800 flex-shrink-0"
          >
            Cancel
          </button>
        </div>
        {err && <p className="text-red-400 text-xs mt-2">Couldn't save. Check your connection.</p>}
      </div>
    )
  }

  if (!latest) {
    return (
      <button onClick={openInput} className="w-full flex items-center justify-between py-4 active:opacity-70">
        <span className="text-sm text-gray-500">Log today's weight</span>
        <Plus size={16} className="text-gray-600" />
      </button>
    )
  }

  return (
    <button onClick={openInput} className="w-full flex items-end justify-between py-4 active:opacity-70 text-left">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tabular-nums">{latest.weight}</span>
          <span className="text-sm text-gray-500">kg</span>
        </div>
        {delta !== null && delta !== 0 && (
          <span className={`flex items-center gap-0.5 text-xs font-medium mt-1 ${delta < 0 ? 'text-green-400' : 'text-orange-400'}`}>
            {delta < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {Math.abs(delta)} kg
          </span>
        )}
      </div>
      {weights.length >= 2 && <Sparkline values={weights.slice(-12).map(w => w.weight)} />}
    </button>
  )
}

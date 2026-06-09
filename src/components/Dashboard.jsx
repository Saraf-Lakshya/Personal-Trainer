import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Scale, Check, Plus } from 'lucide-react'
import { SESSIONS, SESSION_META, WEEKS, getSessionColor, getTodayScheduleInfo } from '../data/workoutPlan'
import { localDateStr } from '../hooks/useBodyWeight'

const SESSION_ORDER = ['A', 'B', 'C', 'D', 'E']

function getTotalVolume(session) {
  if (!session?.exercises) return 0
  return session.exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((a, s) => a + (s.weight * (s.reps ?? 0)), 0)
  }, 0)
}

function formatDuration(secs) {
  if (!secs) return '--'
  const m = Math.floor(secs / 60)
  return `${m}m`
}

function formatDate(isoStr) {
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function Dashboard({ history, user, weights, onLogWeight, onStartWorkout, onNavigate, onSignOut, onChangePassword }) {
  const [showMenu, setShowMenu] = useState(false)
  const { weekType, todayName } = getTodayScheduleInfo()
  const recentSessions = [...history].reverse().slice(0, 4)

  const weekSessions = (() => {
    const weekStart = new Date()
    const dow = weekStart.getDay()
    weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1))
    weekStart.setHours(0, 0, 0, 0)
    return history.filter(h => new Date(h.date) >= weekStart).length
  })()

  const totalSessions = history.length
  const weeklyGoal = WEEKS[weekType]?.count ?? 4

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Welcome back 👋</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">{todayName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-gray-800 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700">
              Week {weekType}
            </span>
            <div className="relative">
              <button onClick={() => setShowMenu(m => !m)} className="active:opacity-70">
                {user?.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border border-gray-700" />
                  : <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300 font-bold">
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
        </div>
        <p className="text-sm text-gray-500 mt-2">What are we doing today?</p>
      </div>

      {/* Weekly goal + body weight */}
      <div className="px-5 mb-6 space-y-3">
        <WeeklyGoalCard done={weekSessions} goal={weeklyGoal} total={totalSessions} />
        <BodyWeightCard weights={weights} onLogWeight={onLogWeight} />
      </div>


      {/* All sessions quick-pick */}
      <div className="px-5 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">All Sessions</p>
        <div className="grid grid-cols-2 gap-3">
          {SESSION_ORDER.map(key => {
            const s = SESSIONS[key]
            const c = getSessionColor(key)
            return (
              <button
                key={key}
                onClick={() => onStartWorkout(key)}
                className={`p-4 rounded-2xl border border-gray-800 bg-gray-900/50 text-left transition-colors active:opacity-80 ${key === 'E' ? 'col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{s.emoji}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.bg} text-white`}>{key}</span>
                </div>
                <p className="font-semibold text-white text-sm">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {s.isHomeSession ? 'Home · Video workout' : `${s.exercises.length} exercises`}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="px-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</p>
            <button onClick={() => onNavigate('history')} className="text-xs text-orange-400 active:text-orange-300">
              See all
            </button>
          </div>
          <div className="space-y-2">
            {recentSessions.map(s => {
              const c = getSessionColor(s.sessionKey)
              const vol = getTotalVolume(s)
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800">
                  <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold ${c.bg} text-white flex-shrink-0`}>
                    {s.sessionKey}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{SESSION_META[s.sessionKey]?.label}</p>
                    <p className="text-xs text-gray-500">{formatDate(s.date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatDuration(s.durationSeconds)}</p>
                    {vol > 0 && <p className="text-xs text-gray-600">{vol.toLocaleString()} kg</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Plan summary */}
      <div className="px-5 mb-32">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-orange-400" />
            <p className="text-sm font-semibold text-gray-300">Your Plan</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <span>Fasted sessions • 9–10am</span>
            <span>45–50 min per session</span>
            <span>60–90s rest between sets</span>
            <span>Progressive overload focus</span>
            <span>Target: lose 7–10kg</span>
            <span>Goal: 1,900–2,100 kcal/day</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ progress, size = 60, stroke = 6, color = '#f97316', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, Math.max(0, progress)))
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

function WeeklyGoalCard({ done, goal, total }) {
  const remaining = Math.max(0, goal - done)
  const hit = done >= goal
  return (
    <div className="flex items-center gap-4 rounded-2xl p-4 border border-gray-800 bg-gray-900/50">
      <ProgressRing progress={goal > 0 ? done / goal : 0} color={hit ? '#22c55e' : '#f97316'}>
        <span className={`text-sm font-bold tabular-nums ${hit ? 'text-green-400' : 'text-white'}`}>
          {done}/{goal}
        </span>
      </ProgressRing>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">This week</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {hit
            ? '🎉 Weekly goal smashed — anything more is a bonus'
            : `${remaining} session${remaining === 1 ? '' : 's'} to hit your goal`}
        </p>
        <p className="text-xs text-gray-600 mt-1">{total} total session{total === 1 ? '' : 's'} logged</p>
      </div>
    </div>
  )
}

function Sparkline({ values, width = 120, height = 32, color = '#60a5fa' }) {
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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BodyWeightCard({ weights, onLogWeight }) {
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

  return (
    <div className="rounded-2xl p-4 border border-gray-800 bg-gray-900/50">
      <div className="flex items-center gap-4">
        <div className="w-[60px] h-[60px] rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Scale size={24} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Body weight</p>
          {latest ? (
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white tabular-nums">{latest.weight}</span>
              <span className="text-xs text-gray-500">kg</span>
              {delta !== null && delta !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${delta < 0 ? 'text-green-400' : 'text-orange-400'}`}>
                  {delta < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  {Math.abs(delta)} kg
                </span>
              )}
              {delta === 0 && <span className="flex items-center gap-0.5 text-xs text-gray-500"><Minus size={12} /> no change</span>}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">Log your weight to track your trend</p>
          )}
        </div>
        {weights.length >= 2 && (
          <Sparkline values={weights.slice(-12).map(w => w.weight)} />
        )}
      </div>

      {open ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="kg"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-center font-mono text-base focus:border-orange-500 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={saving || !val}
            className="w-11 h-11 rounded-xl bg-green-500 text-white flex items-center justify-center active:bg-green-600 disabled:opacity-40 flex-shrink-0"
          >
            <Check size={18} />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-3 h-11 rounded-xl bg-gray-800 text-gray-400 text-sm active:bg-gray-700 flex-shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={openInput}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-800 text-gray-200 text-sm font-semibold active:bg-gray-700"
        >
          <Plus size={15} /> {latest && latest.date === localDateStr() ? "Update today's weight" : "Log today's weight"}
        </button>
      )}

      {err && <p className="text-red-400 text-xs mt-2 text-center">Couldn't save. Check your connection (or that the weights table exists).</p>}
    </div>
  )
}

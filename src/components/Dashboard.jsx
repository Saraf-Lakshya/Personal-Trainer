import { useState } from 'react'
import { Calendar, Flame, TrendingUp, Dumbbell } from 'lucide-react'
import { SESSIONS, SESSION_META, getSessionColor, getTodayScheduleInfo } from '../data/workoutPlan'

const SESSION_ORDER = ['A', 'B', 'C', 'D', 'E']

function getStreak(history) {
  if (!history.length) return 0
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sortedDates = history
    .map(h => { const d = new Date(h.date); d.setHours(0, 0, 0, 0); return d })
    .sort((a, b) => b - a)

  const uniqueDates = [...new Set(sortedDates.map(d => d.getTime()))].map(t => new Date(t))

  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    if (uniqueDates[i].getTime() === expected.getTime()) {
      streak++
    } else {
      break
    }
  }
  return streak
}

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

export default function Dashboard({ history, user, onStartWorkout, onNavigate, onSignOut, onChangePassword }) {
  const [showMenu, setShowMenu] = useState(false)
  const { weekType, todayName } = getTodayScheduleInfo()
  const streak = getStreak(history)
  const recentSessions = [...history].reverse().slice(0, 4)

  const weekSessions = (() => {
    const weekStart = new Date()
    const dow = weekStart.getDay()
    weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1))
    weekStart.setHours(0, 0, 0, 0)
    return history.filter(h => new Date(h.date) >= weekStart).length
  })()

  const totalSessions = history.length

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

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-5 mb-6">
        <StatCard
          label="Streak"
          value={streak}
          unit="days"
          icon={<Flame size={16} className="text-orange-400" />}
          highlight={streak > 0}
        />
        <StatCard
          label="This Week"
          value={weekSessions}
          unit="sessions"
          icon={<Calendar size={16} className="text-blue-400" />}
        />
        <StatCard
          label="Total"
          value={totalSessions}
          unit="sessions"
          icon={<Dumbbell size={16} className="text-purple-400" />}
        />
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

function StatCard({ label, value, unit, icon, highlight }) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? 'bg-orange-500/10 border-orange-500/20' : 'bg-gray-900/50 border-gray-800'}`}>
      <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className={`text-2xl font-bold tabular-nums ${highlight ? 'text-orange-400' : 'text-white'}`}>{value}</p>
      <p className="text-xs text-gray-600">{unit}</p>
    </div>
  )
}

import { useState } from 'react'
import { Play, Calendar, Flame, TrendingUp, ChevronRight, RotateCcw, Dumbbell } from 'lucide-react'
import { SESSIONS, SESSION_META, WEEKS, getSessionColor } from '../data/workoutPlan'

const SESSION_ORDER = ['A', 'B', 'C', 'D']

function getNextSession(history) {
  if (!history.length) return 'A'
  const last = history[history.length - 1].sessionKey
  const idx = SESSION_ORDER.indexOf(last)
  return SESSION_ORDER[(idx + 1) % SESSION_ORDER.length]
}

function getWeekType(history) {
  const total = history.length
  const weekNum = Math.floor(total / 3.5)
  return weekNum % 2 === 0 ? 'A' : 'B'
}

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

export default function Dashboard({ history, onStartWorkout, onNavigate }) {
  const nextSession = getNextSession(history)
  const weekType = getWeekType(history)
  const streak = getStreak(history)
  const recentSessions = [...history].reverse().slice(0, 4)
  const nextSessionData = SESSIONS[nextSession]
  const nextColors = getSessionColor(nextSession)

  const weekSessions = (() => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    return history.filter(h => new Date(h.date) >= weekStart).length
  })()

  const totalSessions = history.length

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-gray-500 text-sm">Welcome back 👋</p>
        <h1 className="text-2xl font-bold text-white mt-1">Your Trainer</h1>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-semibold bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
            Week {weekType}
          </span>
          <span className="text-xs text-gray-500">
            {WEEKS[weekType].days.join(' · ')}
          </span>
        </div>
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

      {/* Next workout card */}
      <div className="px-5 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Next Up</p>
        <div className={`rounded-2xl border ${nextColors.border} bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden`}>
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${nextColors.bg} text-white`}>
                    Session {nextSession}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{nextSessionData.label}</h2>
                <p className="text-gray-400 text-sm mt-1">{nextSessionData.muscles}</p>
              </div>
              <span className="text-4xl">{nextSessionData.emoji}</span>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {nextSessionData.exercises.slice(0, 4).map(ex => (
                <span key={ex.id} className="text-xs text-gray-400 bg-gray-800/80 px-2 py-1 rounded-lg">
                  {ex.name.split(' ').slice(0, 2).join(' ')}
                </span>
              ))}
              {nextSessionData.exercises.length > 4 && (
                <span className="text-xs text-gray-500 px-2 py-1">+{nextSessionData.exercises.length - 4} more</span>
              )}
            </div>

            <button
              onClick={() => onStartWorkout(nextSession)}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-base ${nextColors.bg} active:opacity-80 transition-opacity`}
            >
              <Play size={18} fill="white" />
              Start Session {nextSession}
            </button>
          </div>
        </div>
      </div>

      {/* All sessions quick-pick */}
      <div className="px-5 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">All Sessions</p>
        <div className="grid grid-cols-2 gap-3">
          {SESSION_ORDER.map(key => {
            const s = SESSIONS[key]
            const c = getSessionColor(key)
            const isNext = key === nextSession
            return (
              <button
                key={key}
                onClick={() => onStartWorkout(key)}
                className={`p-4 rounded-2xl border text-left transition-colors active:opacity-80 ${
                  isNext ? `${c.border} ${c.light}` : 'border-gray-800 bg-gray-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{s.emoji}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.bg} text-white`}>{key}</span>
                </div>
                <p className="font-semibold text-white text-sm">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.exercises.length} exercises</p>
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

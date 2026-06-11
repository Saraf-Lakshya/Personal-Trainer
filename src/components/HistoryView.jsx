import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Calendar } from 'lucide-react'
import { SESSION_META, getSessionColor, getRating } from '../data/workoutPlan'
import WorkoutCalendar from './WorkoutCalendar'

function formatTime(isoStr) {
  const d = new Date(isoStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function groupDateLabel(isoStr) {
  const d = new Date(isoStr)
  const startOfDay = date => { const x = new Date(date); x.setHours(0, 0, 0, 0); return x }
  const today = startOfDay(new Date())
  const day = startOfDay(d)
  const diffDays = Math.round((today - day) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

function formatDuration(secs) {
  if (!secs) return '--'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return s ? `${m}m ${s}s` : `${m}m`
}

function getTotalVolume(session) {
  if (!session?.exercises) return 0
  return session.exercises.reduce((acc, ex) =>
    acc + ex.sets.reduce((a, s) => a + ((s.weight || 0) * (s.reps || 0)), 0), 0
  )
}

function getCompletedSets(session) {
  if (!session?.exercises) return 0
  return session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)
}

export default function HistoryView({ history, onDelete }) {
  const [expandedId, setExpandedId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const sorted = [...history].reverse()

  if (!sorted.length) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <Calendar size={48} className="text-gray-700" />
        <p className="text-gray-500">No sessions logged yet.</p>
        <p className="text-gray-600 text-sm">Complete your first workout to see it here.</p>
      </div>
    )
  }

  // Group consecutive sessions by calendar day
  const groups = []
  for (const session of sorted) {
    const dayKey = new Date(session.date).toDateString()
    const last = groups[groups.length - 1]
    if (last && last.key === dayKey) {
      last.sessions.push(session)
    } else {
      groups.push({ key: dayKey, label: groupDateLabel(session.date), sessions: [session] })
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">History</h1>
        <p className="text-gray-500 text-sm mt-1">{sorted.length} session{sorted.length !== 1 ? 's' : ''} logged</p>
      </div>

      <div className="px-4 mb-4">
        <WorkoutCalendar history={history} />
      </div>

      <div className="px-4 pb-32">
        {groups.map(group => (
          <div key={group.key}>
            <p className="text-sm font-semibold text-gray-500 pt-5 pb-1 first:pt-0">{group.label}</p>
            {group.sessions.map(session => {
              const colors = getSessionColor(session.sessionKey)
              const meta = SESSION_META[session.sessionKey]
              const vol = getTotalVolume(session)
              const done = getCompletedSets(session)
              const rating = getRating(session.rating)
              const isExpanded = expandedId === session.id

              return (
                <div key={session.id} className="border-b border-gray-800/60 last:border-0">
                  <button
                    className="w-full flex items-center gap-3 py-3.5 text-left active:opacity-70"
                    onClick={() => setExpandedId(isExpanded ? null : session.id)}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.bg}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">
                        {meta?.label ?? `Session ${session.sessionKey}`} · {formatDuration(session.durationSeconds)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatTime(session.date)}</p>
                    </div>
                    {rating && <span title={rating.label} className="text-lg flex-shrink-0">{rating.emoji}</span>}
                    {isExpanded
                      ? <ChevronUp size={18} className="text-gray-600 flex-shrink-0" />
                      : <ChevronDown size={18} className="text-gray-600 flex-shrink-0" />
                    }
                  </button>

                  {isExpanded && (
                    <div className="pb-4 space-y-3">
                      <div className="flex gap-3 text-xs text-gray-500">
                        {vol > 0 && <span>{vol.toLocaleString()} kg volume</span>}
                        <span>{done} sets completed</span>
                      </div>

                      {session.exercises?.map(ex => {
                        const completedSets = ex.sets.filter(s => s.completed)
                        if (!completedSets.length) return null
                        return (
                          <div key={ex.exerciseId}>
                            <p className="text-sm font-medium text-gray-300 mb-1.5">{ex.exerciseName}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {completedSets.map((s, i) => (
                                <span key={i} className="text-xs bg-gray-900 text-gray-400 px-2 py-1 rounded-lg font-mono">
                                  {s.weight > 0 ? `${s.weight}kg` : ''}{s.weight > 0 && s.reps ? ' × ' : ''}{s.reps > 0 ? `${s.reps}r` : ''}{s.duration > 0 ? `${s.duration}s` : ''}
                                  {!s.weight && !s.reps && !s.duration ? '✓' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      })}

                      <div className="flex justify-end pt-1">
                        {confirmDelete === session.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-gray-500 px-3 py-1.5 rounded-lg bg-gray-900 active:bg-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => { onDelete(session.id); setConfirmDelete(null); setExpandedId(null) }}
                              className="text-xs text-red-400 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 active:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(session.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-600 active:text-red-400"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
